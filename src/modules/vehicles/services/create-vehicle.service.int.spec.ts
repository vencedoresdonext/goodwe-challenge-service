import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import { DatabaseModule } from '../../../database/database.module';
import { PrismaService } from '../../../database/prisma.service';
import { CreateVehicleService } from './create-vehicle.service';
import { cleanDatabase } from '../../../common/test-utils/prisma-test-utils';

describe('CreateVehicleService (Integration)', () => {
  let service: CreateVehicleService;
  let prisma: PrismaService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule],
      providers: [CreateVehicleService],
    }).compile();

    service = module.get<CreateVehicleService>(CreateVehicleService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await module.close();
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);
  });

  it('should create a vehicle and set it as active if it is the first one', async () => {
    const user = await prisma.user.create({
      data: { email: 'user@test.com', password: 'pwd' },
    });

    const result = await service.execute(user.id, {
      model: 'Model',
      brand: 'Brand',
      plate: 'My Tesla',
    });

    expect(result.id).toBeDefined();
    expect(result.model).toBe('Model');
    expect(result.plate).toBe('My Tesla');
    expect(result.isActive).toBe(true); // First vehicle is automatically active
  });

  it('should create a vehicle and set it as inactive if user already has an active vehicle', async () => {
    const user = await prisma.user.create({
      data: { email: 'user@test.com', password: 'pwd' },
    });

    await prisma.vehicle.create({
      data: {
        model: 'Model',
        brand: 'Brand',
        plate: 'First Car',
        userId: user.id,
        isActive: true,
      },
    });

    const result = await service.execute(user.id, {
      model: 'Model',
      brand: 'Brand',
      plate: 'Second Car',
    });

    expect(result.model).toBe('Model');
    expect(result.isActive).toBe(false); // Second vehicle is NOT automatically active
  });
});
