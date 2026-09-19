import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import { DatabaseModule } from '../../../database/database.module';
import { PrismaService } from '../../../database/prisma.service';
import { FindManyVehiclesService } from './find-many-vehicles.service';
import { cleanDatabase } from '../../../common/test-utils/prisma-test-utils';

describe('FindManyVehiclesService (Integration)', () => {
  let service: FindManyVehiclesService;
  let prisma: PrismaService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule],
      providers: [FindManyVehiclesService],
    }).compile();

    service = module.get<FindManyVehiclesService>(FindManyVehiclesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await module.close();
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);
  });

  it('should list all vehicles for a user ordered by creation date', async () => {
    const user = await prisma.user.create({
      data: { email: 'unique_0.795875233504283@test.com', password: 'pwd' },
    });

    // Created slightly in past
    await prisma.vehicle.create({
      data: {
        model: 'Old Car',
        brand: 'Tesla',
        plate: 'OLD-111',
        userId: user.id,
        isActive: false,
        createdAt: new Date(Date.now() - 10000),
      },
    });

    // Created now
    await prisma.vehicle.create({
      data: {
        model: 'New Car',
        brand: 'Tesla',
        plate: 'NEW-222',
        userId: user.id,
        isActive: true,
        createdAt: new Date(),
      },
    });

    const result = await service.execute(user.id);

    expect(result).toHaveLength(2);
    expect(result.some((v) => v.model === 'Old Car')).toBe(true);
    expect(result.some((v) => v.model === 'New Car')).toBe(true);
  });

  it('should return empty array if user has no vehicles', async () => {
    const result = await service.execute('some-user-id');
    expect(result).toEqual([]);
  });
});
