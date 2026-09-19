import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { TokenService } from './token.service';
import { RouteTypeEnum } from '../../../common/enums/route-type.enum';

describe('TokenService (Integration)', () => {
  let service: TokenService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            () => ({
              jwt: {
                appSecret: 'test-app-secret',
                appRefreshSecret: 'test-app-refresh-secret',
                webSecret: 'test-web-secret',
                webRefreshSecret: 'test-web-refresh-secret',
                expiresIn: 3600,
                refreshExpiresIn: 86400,
              },
            }),
          ],
        }),
        JwtModule.register({}),
      ],
      providers: [TokenService],
    }).compile();

    service = module.get<TokenService>(TokenService);
  });

  afterAll(async () => {
    await module.close();
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens for APP route', async () => {
      const payload = {
        sub: 'user-1',
        email: Math.random() + '@app.com',
        roles: [RouteTypeEnum.APP],
      };
      const tokens = await service.generateTokens(payload, RouteTypeEnum.APP);

      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
    });

    it('should generate access and refresh tokens for WEB route', async () => {
      const payload = {
        sub: 'user-1',
        email: Math.random() + '@web.com',
        roles: [RouteTypeEnum.WEB],
      };
      const tokens = await service.generateTokens(payload, RouteTypeEnum.WEB);

      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
    });
  });

  describe('validateRefreshToken', () => {
    it('should validate a valid APP refresh token', async () => {
      const payload = {
        sub: 'user-1',
        email: Math.random() + '@app.com',
        roles: [RouteTypeEnum.APP],
      };
      const { refreshToken } = await service.generateTokens(
        payload,
        RouteTypeEnum.APP,
      );

      const result = await service.validateRefreshToken(
        refreshToken,
        RouteTypeEnum.APP,
      );

      expect(result.sub).toBe('user-1');
      expect(result.email).toBe(payload.email);
      expect(result.roles).toContain(RouteTypeEnum.APP);
    });

    it('should fail validation if wrong routeType secret is used', async () => {
      const payload = {
        sub: 'user-1',
        email: Math.random() + '@app.com',
        roles: [RouteTypeEnum.APP],
      };
      const { refreshToken } = await service.generateTokens(
        payload,
        RouteTypeEnum.APP,
      );

      await expect(
        service.validateRefreshToken(refreshToken, RouteTypeEnum.WEB),
      ).rejects.toThrow('Token inválido ou expirado');
    });
  });
});
