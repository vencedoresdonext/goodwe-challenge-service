import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import { DatabaseModule } from '../../../database/database.module';
import { PrismaService } from '../../../database/prisma.service';
import { UpdateProfileService } from './update-profile.service';
import { cleanDatabase } from '../../../common/test-utils/prisma-test-utils';
import { NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('UpdateProfileService (Integration)', () => {
  let service: UpdateProfileService;
  let prisma: PrismaService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule],
      providers: [UpdateProfileService],
    }).compile();

    service = module.get<UpdateProfileService>(UpdateProfileService);
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
    await expect(
      service.execute('non-existent-id', { fullName: 'New Name' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw ConflictException if phone is already in use by another user', async () => {
    const hashedPassword = await bcrypt.hash('SenhaForte123!', 10);

    const user1 = await prisma.user.create({
      data: {
        email: Math.random() + '@test.com',
        phone: '11999999991',
        password: hashedPassword,
      },
    });

    await prisma.user.create({
      data: {
        email: Math.random() + '@test.com',
        phone: '11999999992',
        password: hashedPassword,
      },
    });

    await expect(
      service.execute(user1.id, { phone: '11999999992' }),
    ).rejects.toThrow(ConflictException);
  });

  it('should update user profile successfully', async () => {
    const hashedPassword = await bcrypt.hash('SenhaForte123!', 10);
    const user = await prisma.user.create({
      data: {
        email: Math.random() + '@test.com',
        fullName: 'Old Name',
        phone: '11999999999',
        password: hashedPassword,
      },
    });

    const result = await service.execute(user.id, {
      fullName: 'New Name',
      phone: '11888888888',
    });

    expect(result.id).toBe(user.id);
    expect(result.fullName).toBe('New Name');
    expect(result.phone).toBe('11888888888');

    // Verify in database
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
    });
    expect(updatedUser?.fullName).toBe('New Name');
    expect(updatedUser?.phone).toBe('11888888888');
  });

  it('should allow update if phone is provided but belongs to the same user', async () => {
    const hashedPassword = await bcrypt.hash('SenhaForte123!', 10);
    const user = await prisma.user.create({
      data: {
        email: Math.random() + '@test.com',
        phone: '11999999999',
        password: hashedPassword,
      },
    });

    const result = await service.execute(user.id, {
      fullName: 'New Name',
      phone: '11999999999',
    });

    expect(result.id).toBe(user.id);
    expect(result.fullName).toBe('New Name');
    expect(result.phone).toBe('11999999999');
  });
});
