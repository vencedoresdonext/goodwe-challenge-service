import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import { DatabaseModule } from '../../../database/database.module';
import { PrismaService } from '../../../database/prisma.service';
import { SignupService } from './signup.service';
import { TokenService } from './token.service';
import { cleanDatabase } from '../../../common/test-utils/prisma-test-utils';
import { ConflictException } from '@nestjs/common';
import { RouteTypeEnum } from '../../../common/enums/route-type.enum';

describe('SignupService (Integration)', () => {
  let service: SignupService;
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
      providers: [SignupService, TokenService],
    }).compile();

    service = module.get<SignupService>(SignupService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await module.close();
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);

    // Setup roles if they don't exist
    await prisma.role.upsert({
      where: { id: RouteTypeEnum.APP },
      update: {},
      create: { id: RouteTypeEnum.APP, name: 'APP_USER' },
    });
    await prisma.role.upsert({
      where: { id: RouteTypeEnum.WEB },
      update: {},
      create: { id: RouteTypeEnum.WEB, name: 'WEB_USER' },
    });
  });

  it('should sign up a user successfully and return tokens', async () => {
    const input = {
      email: Math.random() + '@test.com',
      password: 'Password123!',
      fullName: 'New User',
      routeType: RouteTypeEnum.APP,
    };

    const result = await service.execute(input);

    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();

    const user = await prisma.user.findUnique({
      where: { email: Math.random() + '@test.com' },
    });
    expect(user).toBeDefined();

    const userRole = await prisma.userRole.findFirst({
      where: { userId: user?.id, roleId: RouteTypeEnum.APP },
    });
    expect(userRole).toBeDefined();
  });

  it('should throw ConflictException if email is already in use', async () => {
    const input = {
      email: Math.random() + '@test.com',
      password: 'Password123!',
      routeType: RouteTypeEnum.APP,
    };

    await service.execute(input); // First signup works

    await expect(service.execute(input)).rejects.toThrow(ConflictException);
  });
});
