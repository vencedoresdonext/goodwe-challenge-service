import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import { DatabaseModule } from '../../../database/database.module';
import { PrismaService } from '../../../database/prisma.service';
import { FindStationDetailWebService } from './find-station-detail-web.service';
import { cleanDatabase } from '../../../common/test-utils/prisma-test-utils';
import { NotFoundException } from '@nestjs/common';

describe('FindStationDetailWebService (Integration)', () => {
  let service: FindStationDetailWebService;
  let prisma: PrismaService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule],
      providers: [FindStationDetailWebService],
    }).compile();

    service = module.get<FindStationDetailWebService>(
      FindStationDetailWebService,
    );
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
    await expect(service.execute('non-existent-id', 'user-id')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should return station details filtering out connectors not owned by user', async () => {
    const owner1 = await prisma.user.create({
      data: { email: 'owner1_detail@test.com', password: 'pwd' },
    });
    const owner2 = await prisma.user.create({
      data: { email: 'owner2_detail@test.com', password: 'pwd' },
    });

    const charger1 = await prisma.charger.create({
      data: { receiverUserId: owner1.id },
    });
    const charger2 = await prisma.charger.create({
      data: { receiverUserId: owner2.id },
    });

    const station = await prisma.station.create({
      data: {
        name: 'Mixed Station',
        address: 'Addr',
        latitude: 0,
        longitude: 0,
        pricePerKwhCents: 100,
        isActive: true,
        connectors: {
          create: [
            {
              chargerId: charger1.id,
              connectorType: 'TYPE_2',
              maxPowerKw: 11,
              statusId: 1,
            },
            {
              chargerId: charger2.id,
              connectorType: 'TYPE_2',
              maxPowerKw: 22,
              statusId: 1,
            },
          ],
        },
      },
    });

    const result = await service.execute(station.id, owner1.id);

    expect(result.id).toBe(station.id);
    expect(result.connectors).toHaveLength(1);
    expect(result.connectors![0].chargerId).toBe(charger1.id);
  });
});
