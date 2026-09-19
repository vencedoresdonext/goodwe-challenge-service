import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import { DatabaseModule } from '../../../database/database.module';
import { PrismaService } from '../../../database/prisma.service';
import { RefreshService } from './refresh.service';
import { TokenService } from './token.service';
import { cleanDatabase } from '../../../common/test-utils/prisma-test-utils';
import { UnauthorizedException } from '@nestjs/common';
import { RouteTypeEnum } from '../../../common/enums/route-type.enum';

describe('RefreshService (Integration)', () => {
  let service: RefreshService;
  let tokenService: TokenService;
  let prisma: PrismaService;
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
        DatabaseModule,
        JwtModule.register({}),
      ],
      providers: [RefreshService, TokenService],
    }).compile();

    service = module.get<RefreshService>(RefreshService);
    tokenService = module.get<TokenService>(TokenService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await module.close();
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);

    await prisma.role.upsert({
      where: { id: RouteTypeEnum.APP },
      update: {},
      create: { id: RouteTypeEnum.APP, name: 'APP_USER' },
    });
  });

  it('should refresh tokens successfully with a valid refresh token', async () => {
    const user = await prisma.user.create({
      data: {
        email: Math.random() + '@test.com',
        password: 'hashed-password',
        roles: {
          create: {
            roleId: RouteTypeEnum.APP,
          },
        },
      },
    });

    const { refreshToken } = await tokenService.generateTokens(
      { sub: user.id, email: user.email, roles: [RouteTypeEnum.APP] },
      RouteTypeEnum.APP,
    );

    const result = await service.execute({
      refreshToken,
      routeType: RouteTypeEnum.APP,
    });

    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
  });

  it('should throw UnauthorizedException if refresh token is invalid', async () => {
    await expect(
      service.execute({
        refreshToken: 'invalid-token',
        routeType: RouteTypeEnum.APP,
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if user does not have access to routeType', async () => {
    // Creating user without roles
    const user = await prisma.user.create({
      data: {
        email: Math.random() + '@test.com',
        password: 'hashed-password',
      },
    });

    const { refreshToken } = await tokenService.generateTokens(
      { sub: user.id, email: user.email, roles: [] },
      RouteTypeEnum.APP,
    );

    await expect(
      service.execute({
        refreshToken,
        routeType: RouteTypeEnum.APP,
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
