import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import { DatabaseModule } from '../../../database/database.module';
import { PrismaService } from '../../../database/prisma.service';
import { DeleteVehicleService } from './delete-vehicle.service';
import { cleanDatabase } from '../../../common/test-utils/prisma-test-utils';
import { NotFoundException } from '@nestjs/common';

describe('DeleteVehicleService (Integration)', () => {
  let service: DeleteVehicleService;
  let prisma: PrismaService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule],
      providers: [DeleteVehicleService],
    }).compile();

    service = module.get<DeleteVehicleService>(DeleteVehicleService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await module.close();
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);
  });

  it('should throw NotFoundException if vehicle does not exist or does not belong to user', async () => {
    await expect(service.execute('user-id', 'non-existent-id')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should delete the vehicle if it belongs to the user', async () => {
    const user = await prisma.user.create({
      data: { email: 'unique_0.8483589142893425@test.com', password: 'pwd' },
    });
    const vehicle = await prisma.vehicle.create({
      data: {
        model: 'To Delete',
        brand: 'Tesla',
        plate: 'DEL-123',
        userId: user.id,
        isActive: false,
      },
    });

    await service.execute(user.id, vehicle.id);

    const deleted = await prisma.vehicle.findUnique({
      where: { id: vehicle.id },
    });
    expect(deleted).toBeNull();
  });
});
