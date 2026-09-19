import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import { DatabaseModule } from '../../../database/database.module';
import { PrismaService } from '../../../database/prisma.service';
import { DeleteCustomerCardService } from './delete-customer-card.service';
import { cleanDatabase } from '../../../common/test-utils/prisma-test-utils';
import { NotFoundException } from '@nestjs/common';

describe('DeleteCustomerCardService (Integration)', () => {
  let service: DeleteCustomerCardService;
  let prisma: PrismaService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule],
      providers: [DeleteCustomerCardService],
    }).compile();

    service = module.get<DeleteCustomerCardService>(DeleteCustomerCardService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await module.close();
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);
  });

  it('should throw NotFoundException if card does not exist or does not belong to user', async () => {
    await expect(service.execute('non-existent-id', 'user-id')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should delete the card if it belongs to the user', async () => {
    const user = await prisma.user.create({
      data: { email: 'user@test.com', password: 'pwd' },
    });
    const card = await prisma.customerCard.create({
      data: {
        userId: user.id,
        gatewayToken: 'ext-1',
        lastFourDigits: '1111',
        brand: 'Visa',
        holderName: 'Test',
        expiresAt: new Date(),
      },
    });

    await service.execute(card.id, user.id);

    const deleted = await prisma.customerCard.findUnique({
      where: { id: card.id },
    });
    expect(deleted).toBeNull();
  });
});
