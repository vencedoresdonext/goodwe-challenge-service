import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import { DatabaseModule } from '../../../database/database.module';
import { PrismaService } from '../../../database/prisma.service';
import { ListCustomerCardsService } from './list-customer-cards.service';
import { cleanDatabase } from '../../../common/test-utils/prisma-test-utils';

describe('ListCustomerCardsService (Integration)', () => {
  let service: ListCustomerCardsService;
  let prisma: PrismaService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule],
      providers: [ListCustomerCardsService],
    }).compile();

    service = module.get<ListCustomerCardsService>(ListCustomerCardsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await module.close();
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);
  });

  it('should list cards for the given user', async () => {
    const user = await prisma.user.create({
      data: { email: 'user@test.com', password: 'pwd' },
    });

    await prisma.customerCard.create({
      data: {
        userId: user.id,
        gatewayToken: 'ext-1',
        lastFourDigits: '1111',
        brand: 'Visa',
        holderName: 'Test',
        expiresAt: new Date(),
      },
    });

    const result = await service.execute(user.id);

    expect(result).toHaveLength(1);
    expect(result[0].lastFourDigits).toBe('1111');
  });
});
