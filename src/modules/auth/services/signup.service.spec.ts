import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RouteTypeEnum } from '../../../common/enums/route-type.enum';
import { UserRepository } from '../../../database/repositories/user/user.repository';
import { SignupService } from './signup.service';
import { TokenService } from './token.service';

vi.mock('bcrypt', () => ({
  hash: vi.fn(),
}));

describe('SignupService', () => {
  let service: SignupService;
  let userRepository: any;
  let tokenService: any;

  beforeEach(async () => {
    userRepository = {
      create: vi.fn(),
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
    it('should throw ConflictException if user already exists (P2002)', async () => {
      const p2002Error = new Prisma.PrismaClientKnownRequestError('Error', {
        code: 'P2002',
        clientVersion: '1',
      });
      userRepository.create.mockRejectedValue(p2002Error);

      await expect(
        service.execute({
          email: 'test@test.com',
          password: '123',
          routeType: RouteTypeEnum.APP,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should return token and user if successful', async () => {
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

      expect(userRepository.create).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'hashed',
        fullName: undefined,
        phone: undefined,
        roles: {
          create: {
            roleId: RouteTypeEnum.APP,
          },
        },
      });
      expect(result.accessToken).toBe('token123');
      expect(result.refreshToken).toBe('refresh123');
      expect(bcrypt.hash).toHaveBeenCalledWith('123', 10);
    });
  });
});
