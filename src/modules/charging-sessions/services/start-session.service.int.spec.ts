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
import { StartSessionService } from './start-session.service';
import { ChargingTelemetryPort } from '../../../integrations/http/charging-telemetry/charging-telemetry.port';
import { cleanDatabase } from '../../../common/test-utils/prisma-test-utils';
import { ConflictException } from '@nestjs/common';
import { ChargerSessionStatusEnum } from '../../../common/enums';

describe('StartSessionService (Integration)', () => {
  let service: StartSessionService;
  let prisma: PrismaService;
  let module: TestingModule;
  let telemetryPortMock: any;

  beforeAll(async () => {
    telemetryPortMock = {
      getChargerStatus: vi.fn(),
      startCharging: vi.fn(),
      stopCharging: vi.fn(),
    };

    module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule],
      providers: [
        StartSessionService,
        { provide: ChargingTelemetryPort, useValue: telemetryPortMock },
      ],
    }).compile();

    service = module.get<StartSessionService>(StartSessionService);
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

  it('should start a session successfully when everything is ok', async () => {
    const user = await prisma.user.create({
      data: { email: 'user@test.com', password: 'pwd' },
    });
    const charger = await prisma.charger.create({
      data: { receiverUserId: user.id },
    });

    telemetryPortMock.getChargerStatus.mockResolvedValue({
      connectorStatus: 'AVAILABLE',
    });
    telemetryPortMock.startCharging.mockResolvedValue(true);

    const result = await service.execute(user.id, {
      chargerId: charger.id,
      preAuthorizedAmountCents: 5000,
    });

    expect(result.id).toBeDefined();
    expect(result.statusId).toBe(ChargerSessionStatusEnum.CHARGING);
    expect(telemetryPortMock.startCharging).toHaveBeenCalledWith(charger.id);

    const dbSession = await prisma.chargerSession.findUnique({
      where: { id: result.id },
    });
    expect(dbSession?.statusId).toBe(3);
  });

  it('should throw ConflictException if charger is not available via telemetry', async () => {
    const user = await prisma.user.create({
      data: { email: 'user@test.com', password: 'pwd' },
    });
    const charger = await prisma.charger.create({
      data: { receiverUserId: user.id },
    });

    telemetryPortMock.getChargerStatus.mockResolvedValue({
      connectorStatus: 'CHARGING',
    });

    await expect(
      service.execute(user.id, {
        chargerId: charger.id,
        preAuthorizedAmountCents: 5000,
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should throw ConflictException if user already has an active session', async () => {
    const user = await prisma.user.create({
      data: { email: 'user@test.com', password: 'pwd' },
    });
    const charger1 = await prisma.charger.create({
      data: { receiverUserId: user.id },
    });
    const charger2 = await prisma.charger.create({
      data: { receiverUserId: user.id },
    });

    await prisma.chargerSession.create({
      data: {
        userId: user.id,
        chargerId: charger1.id,
        statusId: ChargerSessionStatusEnum.CHARGING,
      },
    });

    await expect(
      service.execute(user.id, {
        chargerId: charger2.id,
        preAuthorizedAmountCents: 5000,
      }),
    ).rejects.toThrow(ConflictException);
  });
});
