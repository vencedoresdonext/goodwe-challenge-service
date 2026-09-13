import { Test, TestingModule } from '@nestjs/testing';
import { UpdateProfileService } from './update-profile.service';
import { UserRepository } from '../../../database/repositories/user/user.repository';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('UpdateProfileService', () => {
  let service: UpdateProfileService;
  let userRepository: any;

  beforeEach(async () => {
    userRepository = {
      findById: vi.fn(),
      findByPhone: vi.fn(),
      update: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateProfileService,
        { provide: UserRepository, useValue: userRepository },
      ],
    }).compile();

    service = module.get<UpdateProfileService>(UpdateProfileService);
  });

  describe('execute', () => {
    const userId = 'user-1';

    it('should throw NotFoundException if user is not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(service.execute(userId, {})).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if new phone is already in use by another user', async () => {
      userRepository.findById.mockResolvedValue({
        id: userId,
        phone: '111111111',
      });
      userRepository.findByPhone.mockResolvedValue({ id: 'user-2' });

      await expect(
        service.execute(userId, { phone: '222222222' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should not check phone conflict if phone is the same as current', async () => {
      userRepository.findById.mockResolvedValue({
        id: userId,
        phone: '111111111',
        email: 'test@test.com',
      });
      userRepository.update.mockResolvedValue({
        id: userId,
        email: 'test@test.com',
        phone: '111111111',
      });

      await service.execute(userId, { phone: '111111111' });

      expect(userRepository.findByPhone).not.toHaveBeenCalled();
      expect(userRepository.update).toHaveBeenCalledWith(userId, {
        phone: '111111111',
      });
    });

    it('should update and return the updated profile', async () => {
      userRepository.findById.mockResolvedValue({
        id: userId,
        phone: '111111111',
        email: 'test@test.com',
      });
      userRepository.findByPhone.mockResolvedValue(null);
      userRepository.update.mockResolvedValue({
        id: userId,
        email: 'test@test.com',
        fullName: 'New Name',
        phone: '222222222',
        createdAt: new Date('2023-01-01'),
      });

      const result = await service.execute(userId, {
        fullName: 'New Name',
        phone: '222222222',
      });

      expect(userRepository.findByPhone).toHaveBeenCalledWith('222222222');
      expect(userRepository.update).toHaveBeenCalledWith(userId, {
        fullName: 'New Name',
        phone: '222222222',
      });
      expect(result).toEqual({
        id: userId,
        email: 'test@test.com',
        fullName: 'New Name',
        phone: '222222222',
        createdAt: expect.any(Date),
      });
    });
  });
});
