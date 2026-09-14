import { Test, TestingModule } from '@nestjs/testing';
import { FindProfileService } from './find-profile.service';
import { UserRepository } from '../../../database/repositories/user/user.repository';
import { NotFoundException } from '@nestjs/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('FindProfileService', () => {
  let service: FindProfileService;
  let userRepository: any;

  beforeEach(async () => {
    userRepository = {
      findById: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindProfileService,
        { provide: UserRepository, useValue: userRepository },
      ],
    }).compile();

    service = module.get<FindProfileService>(FindProfileService);
  });

  describe('execute', () => {
    const userId = 'user-1';

    it('should throw NotFoundException if user is not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(service.execute(userId)).rejects.toThrow(NotFoundException);
    });

    it('should return the mapped profile if user is found', async () => {
      const mockDate = new Date('2023-01-01');
      userRepository.findById.mockResolvedValue({
        id: userId,
        email: 'test@test.com',
        fullName: 'Test User',
        phone: '111111111',
        createdAt: mockDate,
      });

      const result = await service.execute(userId);

      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual({
        id: userId,
        email: 'test@test.com',
        fullName: 'Test User',
        phone: '111111111',
        createdAt: mockDate,
      });
    });

    it('should return null for optional fields if they are missing', async () => {
      const mockDate = new Date('2023-01-01');
      userRepository.findById.mockResolvedValue({
        id: userId,
        email: 'test@test.com',
        createdAt: mockDate,
      });

      const result = await service.execute(userId);

      expect(result).toEqual({
        id: userId,
        email: 'test@test.com',
        fullName: null,
        phone: null,
        createdAt: mockDate,
      });
    });
  });
});
