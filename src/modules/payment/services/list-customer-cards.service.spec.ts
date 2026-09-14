import { Test, TestingModule } from '@nestjs/testing';
import { ListCustomerCardsService } from './list-customer-cards.service';
import { CustomerCardRepository } from '../../../database/repositories';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('ListCustomerCardsService', () => {
  let service: ListCustomerCardsService;
  let customerCardRepository: any;

  beforeEach(async () => {
    customerCardRepository = {
      findByUserId: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListCustomerCardsService,
        { provide: CustomerCardRepository, useValue: customerCardRepository },
      ],
    }).compile();

    service = module.get<ListCustomerCardsService>(ListCustomerCardsService);
  });

  describe('execute', () => {
    const userId = 'user-1';

    it('should return empty array if no cards found', async () => {
      customerCardRepository.findByUserId.mockResolvedValue([]);

      const result = await service.execute(userId);

      expect(customerCardRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(result).toEqual([]);
    });

    it('should map and return cards on success', async () => {
      const mockDate = new Date('2025-12-31');
      customerCardRepository.findByUserId.mockResolvedValue([
        {
          id: 'card-1',
          userId: userId,
          lastFourDigits: '1234',
          brand: 'visa',
          holderName: 'Test Name',
          expiresAt: mockDate,
          isDefault: true,
          gatewayToken: 'token-1',
        },
      ]);

      const result = await service.execute(userId);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'card-1',
        lastFourDigits: '1234',
        brand: 'visa',
        holderName: 'Test Name',
        expiresAt: mockDate,
        isDefault: true,
      });
    });
  });
});
