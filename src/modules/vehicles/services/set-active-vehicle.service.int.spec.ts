import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import { DatabaseModule } from '../../../database/database.module';
import { PrismaService } from '../../../database/prisma.service';
import { SetActiveVehicleService } from './set-active-vehicle.service';
import { cleanDatabase } from '../../../common/test-utils/prisma-test-utils';
import { NotFoundException } from '@nestjs/common';

describe('SetActiveVehicleService (Integration)', () => {
  let service: SetActiveVehicleService;
  let prisma: PrismaService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule],
      providers: [SetActiveVehicleService],
    }).compile();

    service = module.get<SetActiveVehicleService>(SetActiveVehicleService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await module.close();
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);
  });

  it('should throw NotFoundException if vehicle does not exist', async () => {
    await expect(service.execute('user-id', 'non-existent-id')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should set the requested vehicle as active and the others as inactive', async () => {
    const user = await prisma.user.create({
      data: { email: 'user@test.com', password: 'pwd' },
    });

    const activeVehicle = await prisma.vehicle.create({
      data: {
        plate: 'ACT-111',
        brand: 'Tesla',
        model: 'Model S',
        userId: user.id,
        isActive: true,
      },
    });

    const inactiveVehicle = await prisma.vehicle.create({
      data: {
        plate: 'IN-222',
        brand: 'Tesla',
        model: 'Model S',
        userId: user.id,
        isActive: false,
      },
    });

    await service.execute(user.id, inactiveVehicle.id);

    const previouslyActive = await prisma.vehicle.findUnique({
      where: { id: activeVehicle.id },
    });
    const newlyActive = await prisma.vehicle.findUnique({
      where: { id: inactiveVehicle.id },
    });

    expect(previouslyActive?.isActive).toBe(false);
    expect(newlyActive?.isActive).toBe(true);
  });
});
