import { Test, TestingModule } from '@nestjs/testing';
import { StartSessionService } from './start-session.service';
import { ChargerSessionRepository } from '../../../database/repositories/charger-session/charger-session.repository';
import { ChargerRepository } from '../../../database/repositories/charger/charger.repository';
import { ChargingTelemetryPort } from '../../../integrations/http/charging-telemetry/charging-telemetry.port';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ChargerSessionStatusEnum } from '../../../common/enums';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('StartSessionService', () => {
  let service: StartSessionService;
  let chargerSessionRepository: any;
  let chargerRepository: any;
  let telemetryPort: any;

  beforeEach(async () => {
    chargerSessionRepository = {
      findActiveByChargerId: vi.fn(),
      findActiveByUserId: vi.fn(),
      create: vi.fn(),
    };

    chargerRepository = {
      findById: vi.fn(),
    };

    telemetryPort = {
      getChargerStatus: vi.fn(),
      startCharging: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StartSessionService,
        {
          provide: ChargerSessionRepository,
          useValue: chargerSessionRepository,
        },
        { provide: ChargerRepository, useValue: chargerRepository },
        { provide: ChargingTelemetryPort, useValue: telemetryPort },
      ],
    }).compile();

    service = module.get<StartSessionService>(StartSessionService);
  });

  describe('execute', () => {
    const input = {
      chargerId: 'charger-1',
      vehicleId: 'vehicle-1',
      preAuthorizedAmountCents: 1000,
    };
    const userId = 'user-1';

    it('should throw NotFoundException if charger not found', async () => {
      chargerRepository.findById.mockResolvedValue(null);

      await expect(service.execute(userId, input)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if charger is already in use', async () => {
      chargerRepository.findById.mockResolvedValue({ id: 'charger-1' });
      chargerSessionRepository.findActiveByChargerId.mockResolvedValue({
        id: 'session-1',
      });

      await expect(service.execute(userId, input)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ConflictException if user already has an active session', async () => {
      chargerRepository.findById.mockResolvedValue({ id: 'charger-1' });
      chargerSessionRepository.findActiveByChargerId.mockResolvedValue(null);
      chargerSessionRepository.findActiveByUserId.mockResolvedValue({
        id: 'session-2',
      });

      await expect(service.execute(userId, input)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ConflictException if telemetry status returns null', async () => {
      chargerRepository.findById.mockResolvedValue({ id: 'charger-1' });
      chargerSessionRepository.findActiveByChargerId.mockResolvedValue(null);
      chargerSessionRepository.findActiveByUserId.mockResolvedValue(null);
      telemetryPort.getChargerStatus.mockResolvedValue(null);

      await expect(service.execute(userId, input)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ConflictException if telemetry connectorStatus is not AVAILABLE', async () => {
      chargerRepository.findById.mockResolvedValue({ id: 'charger-1' });
      chargerSessionRepository.findActiveByChargerId.mockResolvedValue(null);
      chargerSessionRepository.findActiveByUserId.mockResolvedValue(null);
      telemetryPort.getChargerStatus.mockResolvedValue({
        connectorStatus: 'CHARGING',
      });

      await expect(service.execute(userId, input)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ConflictException if telemetry startCharging returns null/false', async () => {
      chargerRepository.findById.mockResolvedValue({ id: 'charger-1' });
      chargerSessionRepository.findActiveByChargerId.mockResolvedValue(null);
      chargerSessionRepository.findActiveByUserId.mockResolvedValue(null);
      telemetryPort.getChargerStatus.mockResolvedValue({
        connectorStatus: 'AVAILABLE',
      });
      telemetryPort.startCharging.mockResolvedValue(false);

      await expect(service.execute(userId, input)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should create session and return session info on success', async () => {
      chargerRepository.findById.mockResolvedValue({ id: 'charger-1' });
      chargerSessionRepository.findActiveByChargerId.mockResolvedValue(null);
      chargerSessionRepository.findActiveByUserId.mockResolvedValue(null);
      telemetryPort.getChargerStatus.mockResolvedValue({
        connectorStatus: 'AVAILABLE',
      });
      telemetryPort.startCharging.mockResolvedValue(true);
      chargerSessionRepository.create.mockResolvedValue({
        id: 'session-new',
        userId: userId,
        vehicleId: input.vehicleId,
        chargerId: input.chargerId,
        statusId: ChargerSessionStatusEnum.CHARGING,
        consumedAmountCents: 0,
        energyDeliveredKwh: 0,
        startedAt: new Date(),
        finishedAt: null,
      });

      const result = await service.execute(userId, input);

      expect(chargerSessionRepository.create).toHaveBeenCalledWith({
        userId,
        vehicleId: input.vehicleId,
        chargerId: input.chargerId,
        statusId: ChargerSessionStatusEnum.CHARGING,
        preAuthorizedAmountCents: input.preAuthorizedAmountCents,
      });
      expect(result).toHaveProperty('id', 'session-new');
      expect(result.statusId).toBe(ChargerSessionStatusEnum.CHARGING);
    });
  });
});
