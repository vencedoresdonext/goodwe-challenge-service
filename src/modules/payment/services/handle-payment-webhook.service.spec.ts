import { Test, TestingModule } from '@nestjs/testing';
import { HandlePaymentWebhookService } from './handle-payment-webhook.service';
import {
  ChargerSessionRepository,
  PaymentTransactionRepository,
} from '../../../database/repositories';
import { PaymentGatewayPort } from '../../../integrations/payment-gateway/payment-gateway.port';
import { UnauthorizedException } from '@nestjs/common';
import {
  ChargerSessionStatusEnum,
  TransactionStatusEnum,
} from '../../../common/enums';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('HandlePaymentWebhookService', () => {
  let service: HandlePaymentWebhookService;
  let transactionRepository: any;
  let sessionRepository: any;
  let paymentGateway: any;

  beforeEach(async () => {
    transactionRepository = {
      findByGatewayTransactionId: vi.fn(),
      updateStatus: vi.fn(),
    };

    sessionRepository = {
      updateStatus: vi.fn(),
    };

    paymentGateway = {
      validateWebhookSignature: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HandlePaymentWebhookService,
        {
          provide: PaymentTransactionRepository,
          useValue: transactionRepository,
        },
        { provide: ChargerSessionRepository, useValue: sessionRepository },
        { provide: PaymentGatewayPort, useValue: paymentGateway },
      ],
    }).compile();

    service = module.get<HandlePaymentWebhookService>(
      HandlePaymentWebhookService,
    );
  });

  describe('execute', () => {
    const input = {
      signature: 'valid-sig',
      payload: {
        id: 'webhook-1',
        data: { id: 'gw-tx-1', statusId: 'approved' },
        action: 'payment.updated',
      },
    };

    it('should throw UnauthorizedException if signature is invalid', async () => {
      paymentGateway.validateWebhookSignature.mockReturnValue(false);

      await expect(service.execute(input)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should ignore and return if no gatewayTxId is present', async () => {
      paymentGateway.validateWebhookSignature.mockReturnValue(true);

      const invalidInput = {
        signature: 'valid-sig',
        payload: { action: 'payment.updated' }, // missing id
      };

      await service.execute(invalidInput);

      expect(
        transactionRepository.findByGatewayTransactionId,
      ).not.toHaveBeenCalled();
    });

    it('should ignore and return if transaction is not found', async () => {
      paymentGateway.validateWebhookSignature.mockReturnValue(true);
      transactionRepository.findByGatewayTransactionId.mockResolvedValue(null);

      await service.execute(input);

      expect(transactionRepository.updateStatus).not.toHaveBeenCalled();
    });

    it('should ignore and return if transaction is already in final state', async () => {
      paymentGateway.validateWebhookSignature.mockReturnValue(true);
      transactionRepository.findByGatewayTransactionId.mockResolvedValue({
        id: 'tx-1',
        statusId: TransactionStatusEnum.CAPTURED,
      });

      await service.execute(input);

      expect(transactionRepository.updateStatus).not.toHaveBeenCalled();
    });

    it('should ignore and return if status mapping is unhandled', async () => {
      paymentGateway.validateWebhookSignature.mockReturnValue(true);
      transactionRepository.findByGatewayTransactionId.mockResolvedValue({
        id: 'tx-1',
        statusId: TransactionStatusEnum.PENDING,
      });

      const unknownStatusInput = {
        signature: 'valid-sig',
        payload: {
          data: { id: 'gw-tx-1', statusId: 'unknown_status' },
        },
      };

      await service.execute(unknownStatusInput);

      expect(transactionRepository.updateStatus).not.toHaveBeenCalled();
    });

    it('should process webhook and update transaction & session', async () => {
      paymentGateway.validateWebhookSignature.mockReturnValue(true);
      transactionRepository.findByGatewayTransactionId.mockResolvedValue({
        id: 'tx-1',
        chargerSessionId: 'session-1',
        statusId: TransactionStatusEnum.PENDING,
      });

      await service.execute(input);

      expect(transactionRepository.updateStatus).toHaveBeenCalledWith(
        'tx-1',
        TransactionStatusEnum.CAPTURED,
        { gatewayMetadata: JSON.stringify(input.payload) },
      );

      expect(sessionRepository.updateStatus).toHaveBeenCalledWith(
        'session-1',
        ChargerSessionStatusEnum.AUTHORIZED,
      );
    });
  });
});
