import { Test, TestingModule } from '@nestjs/testing';
import { ProcessCreditCardPaymentService } from './process-credit-card-payment.service';
import {
  ChargerSessionRepository,
  CustomerCardRepository,
  PaymentTransactionRepository,
  ChargerRepository,
} from '../../../database/repositories';
import { PaymentGatewayPort } from '../../../integrations/payment-gateway/payment-gateway.port';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import {
  ChargerSessionStatusEnum,
  PaymentMethodEnum,
  TransactionStatusEnum,
} from '../../../common/enums';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('ProcessCreditCardPaymentService', () => {
  let service: ProcessCreditCardPaymentService;
  let transactionRepository: any;
  let sessionRepository: any;
  let cardRepository: any;
  let chargerRepository: any;
  let paymentGateway: any;

  beforeEach(async () => {
    transactionRepository = {
      findByIdempotencyKey: vi.fn(),
      create: vi.fn(),
    };

    sessionRepository = {
      findActiveByChargerId: vi.fn(),
      create: vi.fn(),
      updateStatus: vi.fn(),
    };

    cardRepository = {
      findById: vi.fn(),
    };

    chargerRepository = {
      findById: vi.fn(),
    };

    paymentGateway = {
      chargeCreditCard: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessCreditCardPaymentService,
        {
          provide: PaymentTransactionRepository,
          useValue: transactionRepository,
        },
        { provide: ChargerSessionRepository, useValue: sessionRepository },
        { provide: CustomerCardRepository, useValue: cardRepository },
        { provide: ChargerRepository, useValue: chargerRepository },
        { provide: PaymentGatewayPort, useValue: paymentGateway },
      ],
    }).compile();

    service = module.get<ProcessCreditCardPaymentService>(
      ProcessCreditCardPaymentService,
    );
  });

  describe('execute', () => {
    const input = {
      idempotencyKey: 'idem-1',
      userId: 'user-1',
      customerCardId: 'card-1',
      chargerId: 'charger-1',
      amountCents: 1500,
      description: 'Test Charge',
      payerEmail: 'test@test.com',
    };

    it('should return existing transaction if idempotency key matches', async () => {
      transactionRepository.findByIdempotencyKey.mockResolvedValue({
        id: 'tx-1',
        chargerSessionId: 'session-1',
        statusId: TransactionStatusEnum.AUTHORIZED,
        gatewayTransactionId: 'gw-1',
        amountCents: 1500,
        finalAmountCents: 1500,
      });

      const result = await service.execute(input);

      expect(result).toEqual({
        transactionId: 'tx-1',
        sessionId: 'session-1',
        statusId: TransactionStatusEnum.AUTHORIZED,
        gatewayTransactionId: 'gw-1',
        amountCents: 1500,
        finalAmountCents: 1500,
      });
      expect(cardRepository.findById).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if card not found or user mismatch', async () => {
      transactionRepository.findByIdempotencyKey.mockResolvedValue(null);
      cardRepository.findById.mockResolvedValue({
        id: 'card-1',
        userId: 'other-user',
      });

      await expect(service.execute(input)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if charger has active session', async () => {
      transactionRepository.findByIdempotencyKey.mockResolvedValue(null);
      cardRepository.findById.mockResolvedValue({
        id: 'card-1',
        userId: 'user-1',
      });
      sessionRepository.findActiveByChargerId.mockResolvedValue({
        id: 'session-1',
      });

      await expect(service.execute(input)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if charger not found or has no receiverUserId', async () => {
      transactionRepository.findByIdempotencyKey.mockResolvedValue(null);
      cardRepository.findById.mockResolvedValue({
        id: 'card-1',
        userId: 'user-1',
      });
      sessionRepository.findActiveByChargerId.mockResolvedValue(null);
      chargerRepository.findById.mockResolvedValue({
        id: 'charger-1',
        receiverUserId: null,
      });

      await expect(service.execute(input)).rejects.toThrow(BadRequestException);
    });

    it('should process payment and handle approved status', async () => {
      transactionRepository.findByIdempotencyKey.mockResolvedValue(null);
      cardRepository.findById.mockResolvedValue({
        id: 'card-1',
        userId: 'user-1',
        gatewayToken: 'token-1',
      });
      sessionRepository.findActiveByChargerId.mockResolvedValue(null);
      chargerRepository.findById.mockResolvedValue({
        id: 'charger-1',
        receiverUserId: 'receiver-1',
      });
      sessionRepository.create.mockResolvedValue({ id: 'session-new' });
      paymentGateway.chargeCreditCard.mockResolvedValue({
        statusId: 'approved',
        gatewayTransactionId: 'gw-new',
        statusDetail: 'accredited',
      });
      transactionRepository.create.mockResolvedValue({ id: 'tx-new' });

      const result = await service.execute(input);

      expect(paymentGateway.chargeCreditCard).toHaveBeenCalledWith({
        gatewayToken: 'token-1',
        amountCents: 1500,
        description: 'Test Charge',
        externalReference: 'session-new',
        installments: 1,
        payerEmail: 'test@test.com',
        receiverAccountId: 'receiver-1',
        capture: false,
      });

      expect(transactionRepository.create).toHaveBeenCalledWith({
        userId: 'user-1',
        chargerSessionId: 'session-new',
        idempotencyKey: 'idem-1',
        paymentMethodId: PaymentMethodEnum.CREDIT_CARD,
        statusId: TransactionStatusEnum.AUTHORIZED,
        amountCents: 1500,
        finalAmountCents: 1500,
        gatewayTransactionId: 'gw-new',
        customerCardId: 'card-1',
        gatewayMetadata: JSON.stringify({ statusDetail: 'accredited' }),
      });

      expect(sessionRepository.updateStatus).toHaveBeenCalledWith(
        'session-new',
        ChargerSessionStatusEnum.AUTHORIZED,
      );

      expect(result).toEqual({
        transactionId: 'tx-new',
        sessionId: 'session-new',
        statusId: TransactionStatusEnum.AUTHORIZED,
        gatewayTransactionId: 'gw-new',
        amountCents: 1500,
        finalAmountCents: 1500,
      });
    });

    it('should handle unknown status gracefully', async () => {
      transactionRepository.findByIdempotencyKey.mockResolvedValue(null);
      cardRepository.findById.mockResolvedValue({
        id: 'card-1',
        userId: 'user-1',
        gatewayToken: 'token-1',
      });
      sessionRepository.findActiveByChargerId.mockResolvedValue(null);
      chargerRepository.findById.mockResolvedValue({
        id: 'charger-1',
        receiverUserId: 'receiver-1',
      });
      sessionRepository.create.mockResolvedValue({ id: 'session-new' });
      paymentGateway.chargeCreditCard.mockResolvedValue({
        statusId: 'unknown-status',
        gatewayTransactionId: 'gw-fail',
      });
      transactionRepository.create.mockResolvedValue({ id: 'tx-fail' });

      const result = await service.execute(input);

      expect(transactionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ statusId: TransactionStatusEnum.FAILED }),
      );
      expect(sessionRepository.updateStatus).toHaveBeenCalledWith(
        'session-new',
        ChargerSessionStatusEnum.FAILED,
      );
      expect(result.statusId).toBe(TransactionStatusEnum.FAILED);
    });
  });
});
