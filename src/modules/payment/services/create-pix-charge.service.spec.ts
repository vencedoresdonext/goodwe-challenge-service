import { Test, TestingModule } from '@nestjs/testing';
import { CreatePixChargeService } from './create-pix-charge.service';
import {
  ChargerSessionRepository,
  PaymentTransactionRepository,
  ChargerRepository,
} from '../../../database/repositories';
import { PaymentGatewayPort } from '../../../integrations/payment-gateway/payment-gateway.port';
import { BadRequestException } from '@nestjs/common';
import {
  ChargerSessionStatusEnum,
  PaymentMethodEnum,
  TransactionStatusEnum,
} from '../../../common/enums';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('CreatePixChargeService', () => {
  let service: CreatePixChargeService;
  let transactionRepository: any;
  let sessionRepository: any;
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
    };

    chargerRepository = {
      findById: vi.fn(),
    };

    paymentGateway = {
      createPixCharge: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreatePixChargeService,
        {
          provide: PaymentTransactionRepository,
          useValue: transactionRepository,
        },
        { provide: ChargerSessionRepository, useValue: sessionRepository },
        { provide: ChargerRepository, useValue: chargerRepository },
        { provide: PaymentGatewayPort, useValue: paymentGateway },
      ],
    }).compile();

    service = module.get<CreatePixChargeService>(CreatePixChargeService);
  });

  describe('execute', () => {
    const input = {
      idempotencyKey: 'idem-pix-1',
      userId: 'user-1',
      chargerId: 'charger-1',
      amountCents: 1500,
      description: 'Test Pix Charge',
      payerEmail: 'test@test.com',
    };

    it('should return existing transaction if idempotency key matches', async () => {
      const mockExpiresAt = new Date('2023-12-31');
      transactionRepository.findByIdempotencyKey.mockResolvedValue({
        id: 'tx-1',
        chargerSessionId: 'session-1',
        pixPayload: 'payload-123',
        pixTxId: 'pix-123',
        pixExpiresAt: mockExpiresAt,
        amountCents: 1500,
        finalAmountCents: 1500,
      });

      const result = await service.execute(input);

      expect(result).toEqual({
        transactionId: 'tx-1',
        sessionId: 'session-1',
        pixPayload: 'payload-123',
        pixTxId: 'pix-123',
        pixExpiresAt: mockExpiresAt,
        amountCents: 1500,
        finalAmountCents: 1500,
      });
      expect(sessionRepository.findActiveByChargerId).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if charger has active session', async () => {
      transactionRepository.findByIdempotencyKey.mockResolvedValue(null);
      sessionRepository.findActiveByChargerId.mockResolvedValue({
        id: 'session-1',
      });

      await expect(service.execute(input)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if charger not found or has no receiverUserId', async () => {
      transactionRepository.findByIdempotencyKey.mockResolvedValue(null);
      sessionRepository.findActiveByChargerId.mockResolvedValue(null);
      chargerRepository.findById.mockResolvedValue({
        id: 'charger-1',
        receiverUserId: null,
      });

      await expect(service.execute(input)).rejects.toThrow(BadRequestException);
    });

    it('should process pix charge successfully', async () => {
      transactionRepository.findByIdempotencyKey.mockResolvedValue(null);
      sessionRepository.findActiveByChargerId.mockResolvedValue(null);
      chargerRepository.findById.mockResolvedValue({
        id: 'charger-1',
        receiverUserId: 'receiver-1',
      });

      sessionRepository.create.mockResolvedValue({ id: 'session-new' });

      const mockExpiresAt = new Date('2023-12-31');
      paymentGateway.createPixCharge.mockResolvedValue({
        gatewayTransactionId: 'gw-pix-new',
        pixPayload: 'payload-new',
        pixTxId: 'pix-tx-new',
        pixExpiresAt: mockExpiresAt,
        qrCodeBase64: 'base64-img',
      });

      transactionRepository.create.mockResolvedValue({ id: 'tx-pix-new' });

      const result = await service.execute(input);

      expect(sessionRepository.create).toHaveBeenCalledWith({
        userId: 'user-1',
        chargerId: 'charger-1',
        statusId: ChargerSessionStatusEnum.AWAITING_PAYMENT,
        preAuthorizedAmountCents: 1500,
      });

      expect(paymentGateway.createPixCharge).toHaveBeenCalledWith({
        amountCents: 1500,
        description: 'Test Pix Charge',
        externalReference: 'session-new',
        payerEmail: 'test@test.com',
        receiverAccountId: 'receiver-1',
      });

      expect(transactionRepository.create).toHaveBeenCalledWith({
        userId: 'user-1',
        chargerSessionId: 'session-new',
        idempotencyKey: 'idem-pix-1',
        paymentMethodId: PaymentMethodEnum.PIX,
        statusId: TransactionStatusEnum.PENDING,
        amountCents: 1500,
        finalAmountCents: 1500,
        gatewayTransactionId: 'gw-pix-new',
        pixPayload: 'payload-new',
        pixTxId: 'pix-tx-new',
        pixExpiresAt: mockExpiresAt,
      });

      expect(result).toEqual({
        transactionId: 'tx-pix-new',
        sessionId: 'session-new',
        pixPayload: 'payload-new',
        pixTxId: 'pix-tx-new',
        pixExpiresAt: mockExpiresAt,
        amountCents: 1500,
        finalAmountCents: 1500,
        qrCodeBase64: 'base64-img',
      });
    });
  });
});
