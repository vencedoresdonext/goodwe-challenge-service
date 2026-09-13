import { Test, TestingModule } from '@nestjs/testing';
import { DeleteCustomerCardService } from './delete-customer-card.service';
import { CustomerCardRepository } from '../../../database/repositories';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('DeleteCustomerCardService', () => {
  let service: DeleteCustomerCardService;
  let customerCardRepository: any;

  beforeEach(async () => {
    customerCardRepository = {
      findById: vi.fn(),
      delete: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteCustomerCardService,
        { provide: CustomerCardRepository, useValue: customerCardRepository },
      ],
    }).compile();

    service = module.get<DeleteCustomerCardService>(DeleteCustomerCardService);
  });

  describe('execute', () => {
    const cardId = 'card-1';
    const userId = 'user-1';

    it('should throw NotFoundException if card is not found', async () => {
      customerCardRepository.findById.mockResolvedValue(null);

      await expect(service.execute(cardId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if card belongs to another user', async () => {
      customerCardRepository.findById.mockResolvedValue({
        id: cardId,
        userId: 'other-user',
      });

      await expect(service.execute(cardId, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should delete the card on success', async () => {
      customerCardRepository.findById.mockResolvedValue({
        id: cardId,
        userId: userId,
      });

      await service.execute(cardId, userId);

      expect(customerCardRepository.delete).toHaveBeenCalledWith(cardId);
    });
  });
});
