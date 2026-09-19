import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import { DatabaseModule } from '../../../database/database.module';
import { PrismaService } from '../../../database/prisma.service';
import { FindManyStationsService } from './find-many-stations.service';
import { cleanDatabase } from '../../../common/test-utils/prisma-test-utils';

describe('FindManyStationsService (Integration)', () => {
  let service: FindManyStationsService;
  let prisma: PrismaService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule],
      providers: [FindManyStationsService],
    }).compile();

    service = module.get<FindManyStationsService>(FindManyStationsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await module.close();
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);
    await prisma.connectorStatus.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1, name: 'AVAILABLE' },
    });
  });

  it('should find stations nearby based on latitude and longitude', async () => {
    // Create stations at specific coordinates
    // FIAP Paulista is roughly: -23.5615, -46.6560
    await prisma.station.create({
      data: {
        id: 'station-1',
        name: 'Station Paulista',
        address: 'Av Paulista',
        latitude: -23.5615,
        longitude: -46.656,
        pricePerKwhCents: 150,
        isActive: true,
      },
    });

    // Osasco is roughly: -23.5329, -46.7920 (more than 10km away from Paulista)
    await prisma.station.create({
      data: {
        id: 'station-2',
        name: 'Station Osasco',
        address: 'Osasco',
        latitude: -23.5329,
        longitude: -46.792,
        pricePerKwhCents: 120,
        isActive: true,
      },
    });

    // Query near Paulista (radius default 10km)
    const result = await service.execute({
      latitude: -23.561,
      longitude: -46.655,
      radiusKm: 10,
    });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('station-1');
    expect(result[0].distance).toBeDefined();
    expect(result[0].distance).toBeLessThan(10);
  });

  it('should return empty array if no stations are nearby', async () => {
    // Query somewhere very far (e.g. RJ)
    const result = await service.execute({
      latitude: -22.9068,
      longitude: -43.1729,
      radiusKm: 10,
    });

    expect(result).toHaveLength(0);
  });
});
