import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import {
  describe,
  it,
  expect,
  beforeEach,
  beforeAll,
  afterAll,
  vi,
} from 'vitest';
import { DatabaseModule } from '../../../database/database.module';
import { PrismaService } from '../../../database/prisma.service';
import { LoginService } from './login.service';
import { TokenService } from './token.service';
import { cleanDatabase } from '../../../common/test-utils/prisma-test-utils';
import { UnauthorizedException, HttpException } from '@nestjs/common';
import { RouteTypeEnum } from '../../../common/enums/route-type.enum';
import * as bcrypt from 'bcrypt';
import { RateLimitCacheService } from '../../../cache/services/rate-limit-cache.service';

describe('LoginService (Integration)', () => {
  let service: LoginService;
  let prisma: PrismaService;
  let module: TestingModule;
  let rateLimitCacheServiceMock: any;

  beforeAll(async () => {
    rateLimitCacheServiceMock = {
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn(),
      delete: vi.fn(),
    };

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
      providers: [
        LoginService,
        TokenService,
        { provide: RateLimitCacheService, useValue: rateLimitCacheServiceMock },
      ],
    }).compile();

    service = module.get<LoginService>(LoginService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await module.close();
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);
    vi.clearAllMocks();

    await prisma.role.upsert({
      where: { id: RouteTypeEnum.APP },
      update: {},
      create: { id: RouteTypeEnum.APP, name: 'APP_USER' },
    });
  });

  it('should login successfully with valid email and password', async () => {
    const hashedPassword = await bcrypt.hash('Password123!', 10);
    const email = Math.random() + '@test.com';
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        roles: {
          create: { roleId: RouteTypeEnum.APP },
        },
      },
    });

    const result = await service.execute({
      identifier: email,
      password: 'Password123!',
      routeType: RouteTypeEnum.APP,
    });

    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(rateLimitCacheServiceMock.get).toHaveBeenCalledWith(email);
  });

  it('should throw UnauthorizedException with wrong password and increment rate limit', async () => {
    const hashedPassword = await bcrypt.hash('Password123!', 10);
    const email = Math.random() + '@test.com';
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    rateLimitCacheServiceMock.get.mockResolvedValue({
      attempts: 0,
      blockCount: 0,
      blockedUntil: 0,
    });

    await expect(
      service.execute({
        identifier: email,
        password: 'WrongPassword!',
        routeType: RouteTypeEnum.APP,
      }),
    ).rejects.toThrow(UnauthorizedException);

    expect(rateLimitCacheServiceMock.set).toHaveBeenCalledWith(
      email,
      expect.objectContaining({ attempts: 1 }),
    );
  });

  it('should throw HttpException TOO_MANY_REQUESTS if account is blocked', async () => {
    rateLimitCacheServiceMock.get.mockResolvedValue({
      attempts: 0,
      blockCount: 1,
      blockedUntil: Date.now() + 60000,
    });

    await expect(
      service.execute({
        identifier: Math.random() + '@test.com',
        password: 'Password123!',
        routeType: RouteTypeEnum.APP,
      }),
    ).rejects.toThrow(HttpException);
  });
});
