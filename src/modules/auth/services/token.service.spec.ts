import { Test, TestingModule } from '@nestjs/testing';
import { TokenService } from './token.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RouteTypeEnum } from '../../../common/enums/route-type.enum';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('TokenService', () => {
  let service: TokenService;
  let jwtService: any;
  let configService: any;

  beforeEach(async () => {
    jwtService = {
      signAsync: vi.fn(),
    };
    configService = {
      get: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
  });

  it('should generate tokens with app secrets for APP route type', async () => {
    configService.get.mockImplementation((key: string) => {
      if (key === 'jwt.appSecret') return 'app-secret';
      if (key === 'jwt.appRefreshSecret') return 'app-refresh-secret';
      if (key === 'jwt.expiresIn') return '15m';
      if (key === 'jwt.refreshExpiresIn') return '7d';
      return null;
    });
    jwtService.signAsync
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');

    const result = await service.generateTokens(
      { sub: '1', email: 'e', roles: [] },
      RouteTypeEnum.APP,
    );

    expect(result).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
    expect(jwtService.signAsync).toHaveBeenNthCalledWith(
      1,
      { sub: '1', email: 'e', roles: [] },
      { secret: 'app-secret', expiresIn: '15m' },
    );
    expect(jwtService.signAsync).toHaveBeenNthCalledWith(
      2,
      { sub: '1', email: 'e', roles: [] },
      { secret: 'app-refresh-secret', expiresIn: '7d' },
    );
  });

  it('should generate tokens with web secrets for WEB route type', async () => {
    configService.get.mockImplementation((key: string) => {
      if (key === 'jwt.webSecret') return 'web-secret';
      if (key === 'jwt.webRefreshSecret') return 'web-refresh-secret';
      if (key === 'jwt.expiresIn') return '15m';
      if (key === 'jwt.refreshExpiresIn') return '7d';
      return null;
    });
    jwtService.signAsync
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');

    const result = await service.generateTokens(
      { sub: '1', email: 'e', roles: [] },
      RouteTypeEnum.WEB,
    );

    expect(result).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
    expect(jwtService.signAsync).toHaveBeenNthCalledWith(
      1,
      { sub: '1', email: 'e', roles: [] },
      { secret: 'web-secret', expiresIn: '15m' },
    );
    expect(jwtService.signAsync).toHaveBeenNthCalledWith(
      2,
      { sub: '1', email: 'e', roles: [] },
      { secret: 'web-refresh-secret', expiresIn: '7d' },
    );
  });
});
