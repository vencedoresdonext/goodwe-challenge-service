import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import {
  describe,
  it,
  expect,
  beforeEach,
  beforeAll,
  afterAll,
  vi,
} from 'vitest';
import { DatabaseModule } from '../../../database/database.module';
import { PrismaService } from '../../../database/prisma.service';
import { FindSessionStatusService } from './find-session-status.service';
import { ChargingTelemetryPort } from '../../../integrations/http/charging-telemetry/charging-telemetry.port';
import { cleanDatabase } from '../../../common/test-utils/prisma-test-utils';
import { NotFoundException } from '@nestjs/common';
import { ChargerSessionStatusEnum } from '../../../common/enums';

describe('FindSessionStatusService (Integration)', () => {
  let service: FindSessionStatusService;
  let prisma: PrismaService;
  let module: TestingModule;
  let telemetryPortMock: any;

  beforeAll(async () => {
    telemetryPortMock = {
      startCharging: vi.fn(),
      stopCharging: vi.fn(),
      getChargingTelemetry: vi
        .fn()
        .mockResolvedValue({ powerKw: 50, energyKwh: 10, socPercent: 80 }),
      getChargerStatus: vi.fn(),
    } as any;

    module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule],
      providers: [
        FindSessionStatusService,
        { provide: ChargingTelemetryPort, useValue: telemetryPortMock },
      ],
    }).compile();

    service = module.get<FindSessionStatusService>(FindSessionStatusService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await module.close();
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);
    vi.clearAllMocks();
  });

  it('should return session status along with telemetry updates', async () => {
    const user = await prisma.user.create({
      data: { email: 'user@test.com', password: 'pwd' },
    });
    const charger = await prisma.charger.create({
      data: { receiverUserId: user.id },
    });
    const session = await prisma.chargerSession.create({
      data: {
        userId: user.id,
        chargerId: charger.id,
        statusId: ChargerSessionStatusEnum.CHARGING,
      },
    });

    telemetryPortMock.getChargingTelemetry.mockResolvedValue({
      energyDeliveredKwh: 5.5,
    });

    const result = await service.execute(user.id, session.id);

    expect(result.id).toBe(session.id);
    expect(result.energyDeliveredKwh).toBe(5.5);
  });

  it('should throw NotFoundException if session does not belong to user', async () => {
    const user1 = await prisma.user.create({
      data: { email: 'user@test.com', password: 'pwd' },
    });
    const user2 = await prisma.user.create({
      data: { email: 'user2@test.com', password: 'pwd' },
    });
    const charger = await prisma.charger.create({
      data: { receiverUserId: user1.id },
    });

    const session = await prisma.chargerSession.create({
      data: {
        userId: user1.id,
        chargerId: charger.id,
        statusId: ChargerSessionStatusEnum.CHARGING,
      },
    });

    await expect(service.execute(user2.id, session.id)).rejects.toThrow(
      NotFoundException,
    );
  });
});
