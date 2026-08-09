import { Test, TestingModule } from '@nestjs/testing';
import { SignupService } from './signup.service';
import { UserRepository } from '../../../database/repositories/user/user.repository';
import { TokenService } from './token.service';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RouteTypeEnum } from '../../../common/enums/route-type.enum';
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('bcrypt', () => ({
  hash: vi.fn(),
}));

describe('SignupService', () => {
  let service: SignupService;
  let userRepository: any;
  let tokenService: any;

  beforeEach(async () => {
    userRepository = {
      findByEmail: vi.fn(),
      create: vi.fn(),
      addRoleToUser: vi.fn(),
    };

    tokenService = {
      generateTokens: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignupService,
        { provide: UserRepository, useValue: userRepository },
        { provide: TokenService, useValue: tokenService },
      ],
    }).compile();

    service = module.get<SignupService>(SignupService);
  });

  describe('execute', () => {
    it('should throw BadRequestException if user already exists', async () => {
      userRepository.findByEmail.mockResolvedValue({ id: '1' });
      await expect(
        service.execute({
          email: 'test@test.com',
          password: '123',
          routeType: RouteTypeEnum.APP,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should return token and user if successful', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed' as never);
      userRepository.create.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
      });
      tokenService.generateTokens.mockResolvedValue({
        accessToken: 'token123',
        refreshToken: 'refresh123',
      });

      const result = await service.execute({
        email: 'test@test.com',
        password: '123',
        routeType: RouteTypeEnum.APP,
      });

      expect(userRepository.addRoleToUser).toHaveBeenCalledWith(
        '1',
        RouteTypeEnum.APP,
      );
      expect(result.accessToken).toBe('token123');
      expect(result.refreshToken).toBe('refresh123');
      expect(bcrypt.hash).toHaveBeenCalledWith('123', 10);
    });
  });
});
