import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import { DatabaseModule } from '../../../database/database.module';
import { PrismaService } from '../../../database/prisma.service';
import { FindStationDetailService } from './find-station-detail.service';
import { cleanDatabase } from '../../../common/test-utils/prisma-test-utils';
import { NotFoundException } from '@nestjs/common';

describe('FindStationDetailService (Integration)', () => {
  let service: FindStationDetailService;
  let prisma: PrismaService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule],
      providers: [FindStationDetailService],
    }).compile();

    service = module.get<FindStationDetailService>(FindStationDetailService);
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

  it('should throw NotFoundException if station does not exist', async () => {
    await expect(service.execute('non-existent-id')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should return station details including connectors', async () => {
    // Basic reference data
    const owner = await prisma.user.create({
      data: { email: 'user@test.com', password: 'hash' },
    });

    const charger = await prisma.charger.create({
      data: { receiverUserId: owner.id },
    });

    const station = await prisma.station.create({
      data: {
        name: 'Test Station',
        address: 'Test Addr',
        latitude: 0,
        longitude: 0,
        pricePerKwhCents: 200,
        isActive: true,
        connectors: {
          create: {
            chargerId: charger.id,
            connectorType: 'TYPE_2',
            maxPowerKw: 22,
            statusId: 1,
          },
        },
      },
    });

    const result = await service.execute(station.id);

    expect(result.id).toBe(station.id);
    expect(result.pricePerKwh).toBe(2);
    expect(result.connectors).toBeDefined();
    expect(result.connectors).toHaveLength(1);
    expect(result.connectors![0].connectorType).toBe('TYPE_2');
    expect(result.connectors![0].chargerId).toBe(charger.id);
  });
});
