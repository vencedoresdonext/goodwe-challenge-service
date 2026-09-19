import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import { DatabaseModule } from '../../../database/database.module';
import { PrismaService } from '../../../database/prisma.service';
import { FindManyStationsWebService } from './find-many-stations-web.service';
import { cleanDatabase } from '../../../common/test-utils/prisma-test-utils';

describe('FindManyStationsWebService (Integration)', () => {
  let service: FindManyStationsWebService;
  let prisma: PrismaService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule],
      providers: [FindManyStationsWebService],
    }).compile();

    service = module.get<FindManyStationsWebService>(
      FindManyStationsWebService,
    );
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await module.close();
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);
  });

  it('should return only stations that have chargers owned by the user', async () => {
    // Users
    const owner1 = await prisma.user.create({
      data: { email: 'owner1_web1@test.com', password: 'pwd' },
    });
    const owner2 = await prisma.user.create({
      data: { email: 'owner2_web2@test.com', password: 'pwd' },
    });

    // Chargers
    const charger1 = await prisma.charger.create({
      data: { receiverUserId: owner1.id },
    });
    const charger2 = await prisma.charger.create({
      data: { receiverUserId: owner2.id },
    });

    // Stations
    await prisma.station.create({
      data: {
        id: 'station-1',
        name: 'Owner 1 Station',
        address: 'Addr',
        latitude: 0,
        longitude: 0,
        pricePerKwhCents: 100,
        isActive: true,
        connectors: {
          create: {
            chargerId: charger1.id,
            connectorType: 'TYPE_2',
            maxPowerKw: 11,
            statusId: 1,
          },
        },
      },
    });

    await prisma.station.create({
      data: {
        id: 'station-2',
        name: 'Owner 2 Station',
        address: 'Addr',
        latitude: 0,
        longitude: 0,
        pricePerKwhCents: 100,
        isActive: true,
        connectors: {
          create: {
            chargerId: charger2.id,
            connectorType: 'TYPE_2',
            maxPowerKw: 11,
            statusId: 1,
          },
        },
      },
    });

    const result = await service.execute(owner1.id);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('station-1');
    expect(result[0].connectors).toHaveLength(1);
    expect(result[0].connectors![0].chargerId).toBe(charger1.id);
  });
});
