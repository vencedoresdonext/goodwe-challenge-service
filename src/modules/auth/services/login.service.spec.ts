import { Test, TestingModule } from '@nestjs/testing';
import { LoginService } from './login.service';
import { UserRepository } from '../../../database/repositories/user/user.repository';
import { TokenService } from './token.service';
import { UnauthorizedException, HttpException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RouteTypeEnum } from '../../../common/enums/route-type.enum';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RateLimitCacheService } from '../../../cache/services/rate-limit-cache.service';

vi.mock('bcrypt', () => ({
  compare: vi.fn(),
  hash: vi.fn(),
}));

describe('LoginService', () => {
  let service: LoginService;
  let userRepository: any;
  let tokenService: any;
  let rateLimitCacheService: any;

  beforeEach(async () => {
    userRepository = {
      findByEmail: vi.fn(),
      findRolesByUserId: vi.fn(),
    };

    tokenService = {
      generateTokens: vi.fn(),
    };

    rateLimitCacheService = {
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginService,
        { provide: UserRepository, useValue: userRepository },
        { provide: TokenService, useValue: tokenService },
        { provide: RateLimitCacheService, useValue: rateLimitCacheService },
      ],
    }).compile();

    service = module.get<LoginService>(LoginService);
  });

  describe('execute', () => {
    beforeEach(() => {
      rateLimitCacheService.get.mockResolvedValue(null);
    });

    it('should throw HttpException if account is blocked (429)', async () => {
      rateLimitCacheService.get.mockResolvedValue({
        attempts: 3,
        blockCount: 1,
        blockedUntil: Date.now() + 60000,
      });
      await expect(
        service.execute({
          email: 'test@test.com',
          password: '123',
          routeType: RouteTypeEnum.APP,
        }),
      ).rejects.toThrow(HttpException);
    });

    it('should throw UnauthorizedException and increment attempts if user not found', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      await expect(
        service.execute({
          email: 'test@test.com',
          password: '123',
          routeType: RouteTypeEnum.APP,
        }),
      ).rejects.toThrow(UnauthorizedException);
      expect(rateLimitCacheService.set).toHaveBeenCalledWith(
        'login:test@test.com',
        { attempts: 1, blockCount: 0, blockedUntil: 0 },
      );
    });

    it('should throw UnauthorizedException and increment attempts if password invalid', async () => {
      userRepository.findByEmail.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        password: 'hash',
      });
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);
      await expect(
        service.execute({
          email: 'test@test.com',
          password: '123',
          routeType: RouteTypeEnum.APP,
        }),
      ).rejects.toThrow(UnauthorizedException);
      expect(rateLimitCacheService.set).toHaveBeenCalledWith(
        'login:test@test.com',
        { attempts: 1, blockCount: 0, blockedUntil: 0 },
      );
    });

    it('should block account if failed attempts reach 3', async () => {
      rateLimitCacheService.get.mockResolvedValue({
        attempts: 2,
        blockCount: 0,
        blockedUntil: 0,
      });
      userRepository.findByEmail.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        password: 'hash',
      });
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(
        service.execute({
          email: 'test@test.com',
          password: '123',
          routeType: RouteTypeEnum.APP,
        }),
      ).rejects.toThrow(HttpException);
      expect(rateLimitCacheService.set).toHaveBeenCalledWith(
        'login:test@test.com',
        expect.objectContaining({ attempts: 0, blockCount: 1 }),
      );
    });

    it('should throw UnauthorizedException if user does not have the required role', async () => {
      userRepository.findByEmail.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        password: 'hash',
      });
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      userRepository.findRolesByUserId.mockResolvedValue([RouteTypeEnum.WEB]); // Has WEB, but needs APP

      await expect(
        service.execute({
          email: 'test@test.com',
          password: '123',
          routeType: RouteTypeEnum.APP,
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should clear rate limit and return token if successful', async () => {
      rateLimitCacheService.get.mockResolvedValue({
        attempts: 1,
        blockCount: 0,
        blockedUntil: 0,
      });
      userRepository.findByEmail.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        password: 'hash',
      });
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      userRepository.findRolesByUserId.mockResolvedValue([RouteTypeEnum.APP]);
      tokenService.generateTokens.mockResolvedValue({
        accessToken: 'token123',
        refreshToken: 'refresh123',
      });

      const result = await service.execute({
        email: 'test@test.com',
        password: '123',
        routeType: RouteTypeEnum.APP,
      });
      expect(rateLimitCacheService.delete).toHaveBeenCalledWith(
        'login:test@test.com',
      );
      expect(result.accessToken).toBe('token123');
      expect(result.refreshToken).toBe('refresh123');
    });
  });
});
