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
import { StopSessionService } from './stop-session.service';
import { ChargingTelemetryPort } from '../../../integrations/http/charging-telemetry/charging-telemetry.port';
import { cleanDatabase } from '../../../common/test-utils/prisma-test-utils';
import { ConflictException } from '@nestjs/common';

describe('StopSessionService (Integration)', () => {
  let service: StopSessionService;
  let prisma: PrismaService;
  let module: TestingModule;
  let telemetryPortMock: any;

  beforeAll(async () => {
    telemetryPortMock = {
      startCharging: vi.fn(),
      stopCharging: vi.fn(),
      getChargingTelemetry: vi.fn().mockResolvedValue({
        powerKw: 50,
        energyDeliveredKwh: 10,
        socPercent: 80,
      }),
    } as any;

    module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule],
      providers: [
        StopSessionService,
        { provide: ChargingTelemetryPort, useValue: telemetryPortMock },
      ],
    }).compile();

    service = module.get<StopSessionService>(StopSessionService);
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

  it('should stop an active session successfully', async () => {
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
        statusId: 3, // CHARGING
      },
    });

    telemetryPortMock.stopCharging.mockResolvedValue(true);

    const result = await service.execute(user.id, session.id, {
      paymentMethodId: 1,
    });

    expect(result.statusId).toBe(4); // FINISHED
    expect(result.finishedAt).toBeDefined();

    const dbSession = await prisma.chargerSession.findUnique({
      where: { id: session.id },
    });
    expect(dbSession?.statusId).toBe(4); // FINISHED
  });

  it('should throw ConflictException if session is already finished', async () => {
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
        statusId: 4, // FINISHED
      },
    });

    await expect(
      service.execute(user.id, session.id, { paymentMethodId: 1 }),
    ).rejects.toThrow(ConflictException);
  });
});
