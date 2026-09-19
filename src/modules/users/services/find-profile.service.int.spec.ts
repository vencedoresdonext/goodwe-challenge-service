import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import { DatabaseModule } from '../../../database/database.module';
import { PrismaService } from '../../../database/prisma.service';
import { FindProfileService } from './find-profile.service';
import { cleanDatabase } from '../../../common/test-utils/prisma-test-utils';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('FindProfileService (Integration)', () => {
  let service: FindProfileService;
  let prisma: PrismaService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule],
      providers: [FindProfileService],
    }).compile();

    service = module.get<FindProfileService>(FindProfileService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await module.close();
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);
  });

  it('should throw NotFoundException if user is not found', async () => {
    await expect(service.execute('non-existent-id')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should return the mapped profile if user is found', async () => {
    const hashedPassword = await bcrypt.hash('SenhaForte123!', 10);
    const user = await prisma.user.create({
      data: {
        email: 'user@test.com',
        phone: '11999999999',
        fullName: 'Integration Test User',
        password: hashedPassword,
      },
    });

    const result = await service.execute(user.id);

    expect(result).toBeDefined();
    expect(result.id).toBe(user.id);
    expect(result.email).toBe('user@test.com');
    expect(result.fullName).toBe('Integration Test User');
    expect(result.phone).toBe('11999999999');
    expect(result.createdAt).toBeInstanceOf(Date);
  });

  it('should return null for optional fields if they are missing', async () => {
    const hashedPassword = await bcrypt.hash('SenhaForte123!', 10);
    const user = await prisma.user.create({
      data: {
        email: 'user@test.com',
        password: hashedPassword,
      },
    });

    const result = await service.execute(user.id);

    expect(result).toBeDefined();
    expect(result.id).toBe(user.id);
    expect(result.email).toBe('user@test.com');
    expect(result.fullName).toBeNull();
    expect(result.phone).toBeNull();
  });
});
