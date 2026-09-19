import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import { DatabaseModule } from '../../../database/database.module';
import { PrismaService } from '../../../database/prisma.service';
import { FindManyTransactionsService } from './find-many-transactions.service';
import { cleanDatabase } from '../../../common/test-utils/prisma-test-utils';

describe('FindManyTransactionsService (Integration)', () => {
  let service: FindManyTransactionsService;
  let prisma: PrismaService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule],
      providers: [FindManyTransactionsService],
    }).compile();

    service = module.get<FindManyTransactionsService>(
      FindManyTransactionsService,
    );
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await module.close();
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);
  });

  it('should return transactions for the user', async () => {
    const user = await prisma.user.create({
      data: { email: 'user@test.com', password: 'pwd' },
    });

    await prisma.paymentTransaction.create({
      data: {
        userId: user.id,
        amountCents: 5000,
        finalAmountCents: 5000,
        paymentMethodId: 1, // CREDIT CARD
        statusId: 2, // AUTHORIZED
        idempotencyKey: 'idem-1',
      },
    });

    const result = await service.execute(user.id, 0, 10);

    expect(result).toHaveLength(1);
    expect(result[0].amountCents).toBe(5000);
    expect(result[0].statusId).toBe(2); // AUTHORIZED
  });
});
