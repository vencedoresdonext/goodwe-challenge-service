import { Test, TestingModule } from '@nestjs/testing';
import { FindSessionStatusService } from './find-session-status.service';
import { ChargerSessionRepository } from '../../../database/repositories/charger-session/charger-session.repository';
import { ChargingTelemetryPort } from '../../../integrations/http/charging-telemetry/charging-telemetry.port';
import { NotFoundException } from '@nestjs/common';
import { ChargerSessionStatusEnum } from '../../../common/enums';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('FindSessionStatusService', () => {
  let service: FindSessionStatusService;
  let chargerSessionRepository: any;
  let telemetryPort: any;

  beforeEach(async () => {
    chargerSessionRepository = {
      findById: vi.fn(),
    };

    telemetryPort = {
      getChargingTelemetry: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindSessionStatusService,
        {
          provide: ChargerSessionRepository,
          useValue: chargerSessionRepository,
        },
        { provide: ChargingTelemetryPort, useValue: telemetryPort },
      ],
    }).compile();

    service = module.get<FindSessionStatusService>(FindSessionStatusService);
  });

  describe('execute', () => {
    const userId = 'user-1';
    const sessionId = 'session-1';

    it('should throw NotFoundException if session not found', async () => {
      chargerSessionRepository.findById.mockResolvedValue(null);

      await expect(service.execute(userId, sessionId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if session belongs to another user', async () => {
      chargerSessionRepository.findById.mockResolvedValue({
        id: sessionId,
        userId: 'other-user',
      });

      await expect(service.execute(userId, sessionId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return session without telemetry if status is not CHARGING', async () => {
      const sessionData = {
        id: sessionId,
        userId,
        vehicleId: 'vehicle-1',
        chargerId: 'charger-1',
        statusId: ChargerSessionStatusEnum.COMPLETED,
        consumedAmountCents: 1500,
        energyDeliveredKwh: 10,
        startedAt: new Date(),
        finishedAt: new Date(),
      };
      chargerSessionRepository.findById.mockResolvedValue(sessionData);

      const result = await service.execute(userId, sessionId);

      expect(telemetryPort.getChargingTelemetry).not.toHaveBeenCalled();
      expect(result.telemetry).toBeUndefined();
      expect(result.energyDeliveredKwh).toBe(10);
    });

    it('should return session with telemetry if status is CHARGING', async () => {
      const sessionData = {
        id: sessionId,
        userId,
        vehicleId: 'vehicle-1',
        chargerId: 'charger-1',
        statusId: ChargerSessionStatusEnum.CHARGING,
        consumedAmountCents: 0,
        energyDeliveredKwh: 0,
        startedAt: new Date(),
        finishedAt: null,
      };
      chargerSessionRepository.findById.mockResolvedValue(sessionData);

      const telemetryData = {
        energyDeliveredKwh: 5,
        powerKw: 50,
        batteryPercentage: 60,
        estimatedTimeLeftMinutes: 30,
      };
      telemetryPort.getChargingTelemetry.mockResolvedValue(telemetryData);

      const result = await service.execute(userId, sessionId);

      expect(telemetryPort.getChargingTelemetry).toHaveBeenCalledWith(
        sessionId,
      );
      expect(result.energyDeliveredKwh).toBe(5);
      expect(result.telemetry).toEqual({
        powerKw: 50,
        batteryPercentage: 60,
        estimatedTimeLeftMinutes: 30,
      });
    });

    it('should handle missing telemetry data when CHARGING gracefully', async () => {
      const sessionData = {
        id: sessionId,
        userId,
        vehicleId: 'vehicle-1',
        chargerId: 'charger-1',
        statusId: ChargerSessionStatusEnum.CHARGING,
        consumedAmountCents: 0,
        energyDeliveredKwh: 2,
        startedAt: new Date(),
        finishedAt: null,
      };
      chargerSessionRepository.findById.mockResolvedValue(sessionData);
      telemetryPort.getChargingTelemetry.mockResolvedValue(null);

      const result = await service.execute(userId, sessionId);

      expect(telemetryPort.getChargingTelemetry).toHaveBeenCalledWith(
        sessionId,
      );
      expect(result.energyDeliveredKwh).toBe(2); // Should fallback to session's energy
      expect(result.telemetry).toBeUndefined();
    });
  });
});
