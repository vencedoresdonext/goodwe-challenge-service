import { Test, TestingModule } from '@nestjs/testing';
import { FindManyTransactionsService } from './find-many-transactions.service';
import { PaymentTransactionRepository } from '../../../database/repositories/payment-transaction/payment-transaction.repository';
import {
  TransactionStatusEnum,
  PaymentMethodEnum,
} from '../../../common/enums';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('FindManyTransactionsService', () => {
  let service: FindManyTransactionsService;
  let paymentTransactionRepository: any;

  beforeEach(async () => {
    paymentTransactionRepository = {
      findByUserId: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindManyTransactionsService,
        {
          provide: PaymentTransactionRepository,
          useValue: paymentTransactionRepository,
        },
      ],
    }).compile();

    service = module.get<FindManyTransactionsService>(
      FindManyTransactionsService,
    );
  });

  describe('execute', () => {
    const userId = 'user-1';

    it('should call repository with default skip and take', async () => {
      paymentTransactionRepository.findByUserId.mockResolvedValue([]);

      await service.execute(userId);

      expect(paymentTransactionRepository.findByUserId).toHaveBeenCalledWith(
        userId,
        0,
        20,
      );
    });

    it('should call repository with provided skip and take', async () => {
      paymentTransactionRepository.findByUserId.mockResolvedValue([]);

      await service.execute(userId, 10, 50);

      expect(paymentTransactionRepository.findByUserId).toHaveBeenCalledWith(
        userId,
        10,
        50,
      );
    });

    it('should map and return transactions correctly', async () => {
      const mockDate = new Date('2023-01-01');
      paymentTransactionRepository.findByUserId.mockResolvedValue([
        {
          id: 'tx-1',
          chargerSessionId: 'session-1',
          amountCents: 1500,
          statusId: TransactionStatusEnum.AUTHORIZED,
          paymentMethodId: PaymentMethodEnum.CREDIT_CARD,
          createdAt: mockDate,
          updatedAt: mockDate,
          userId: userId,
        },
      ]);

      const result = await service.execute(userId);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'tx-1',
        chargerSessionId: 'session-1',
        amountCents: 1500,
        statusId: TransactionStatusEnum.AUTHORIZED,
        paymentMethodId: PaymentMethodEnum.CREDIT_CARD,
        createdAt: mockDate,
        updatedAt: mockDate,
      });
    });
  });
});
