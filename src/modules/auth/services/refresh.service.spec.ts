import { Test, TestingModule } from '@nestjs/testing';
import { RefreshService } from './refresh.service';
import { TokenService } from './token.service';
import { UserRepository } from '../../../database/repositories/user/user.repository';
import { UnauthorizedException } from '@nestjs/common';
import { RouteTypeEnum } from '../../../common/enums/route-type.enum';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('RefreshService', () => {
  let service: RefreshService;
  let tokenService: any;
  let userRepository: any;

  beforeEach(async () => {
    tokenService = {
      validateRefreshToken: vi.fn(),
      generateTokens: vi.fn(),
    };
    userRepository = {
      findById: vi.fn(),
      findRolesByUserId: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshService,
        { provide: TokenService, useValue: tokenService },
        { provide: UserRepository, useValue: userRepository },
      ],
    }).compile();

    service = module.get<RefreshService>(RefreshService);
  });

  describe('execute', () => {
    it('should throw UnauthorizedException if token is invalid', async () => {
      tokenService.validateRefreshToken.mockRejectedValue(
        new Error('Invalid token'),
      );
      await expect(
        service.execute({
          refreshToken: 'invalid',
          routeType: RouteTypeEnum.APP,
        }),
      ).rejects.toThrow(
        new UnauthorizedException('Token de atualização inválido ou expirado'),
      );
    });

    it('should throw UnauthorizedException if user not found', async () => {
      tokenService.validateRefreshToken.mockResolvedValue({
        sub: '1',
        email: 'test@test.com',
        roles: [],
      });
      userRepository.findById.mockResolvedValue(null);
      await expect(
        service.execute({
          refreshToken: 'valid',
          routeType: RouteTypeEnum.APP,
        }),
      ).rejects.toThrow(new UnauthorizedException('Usuário não encontrado'));
    });

    it('should throw UnauthorizedException if user does not have the required role', async () => {
      tokenService.validateRefreshToken.mockResolvedValue({
        sub: '1',
        email: 'test@test.com',
        roles: [RouteTypeEnum.WEB],
      });
      userRepository.findById.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
      });
      userRepository.findRolesByUserId.mockResolvedValue([RouteTypeEnum.WEB]);

      await expect(
        service.execute({
          refreshToken: 'valid',
          routeType: RouteTypeEnum.APP,
        }),
      ).rejects.toThrow(
        new UnauthorizedException(
          `Usuário não tem acesso ao routeType ${RouteTypeEnum.APP}`,
        ),
      );
    });

    it('should throw generic UnauthorizedException if an unexpected error occurs', async () => {
      tokenService.validateRefreshToken.mockResolvedValue({
        sub: '1',
        email: 'test@test.com',
        roles: [RouteTypeEnum.APP],
      });
      userRepository.findById.mockRejectedValue(new Error('Database down'));

      await expect(
        service.execute({
          refreshToken: 'valid',
          routeType: RouteTypeEnum.APP,
        }),
      ).rejects.toThrow(
        new UnauthorizedException('Token de atualização inválido ou expirado'),
      );
    });

    it('should return new tokens if successful', async () => {
      tokenService.validateRefreshToken.mockResolvedValue({
        sub: '1',
        email: 'test@test.com',
        roles: [RouteTypeEnum.APP],
      });
      userRepository.findById.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
      });
      userRepository.findRolesByUserId.mockResolvedValue([RouteTypeEnum.APP]);
      tokenService.generateTokens.mockResolvedValue({
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
      });

      const result = await service.execute({
        refreshToken: 'valid',
        routeType: RouteTypeEnum.APP,
      });
      expect(result).toEqual({
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
      });
    });
  });
});
