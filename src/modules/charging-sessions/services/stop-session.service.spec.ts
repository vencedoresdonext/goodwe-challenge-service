import { Test, TestingModule } from '@nestjs/testing';
import { StopSessionService } from './stop-session.service';
import { ChargerSessionRepository } from '../../../database/repositories/charger-session/charger-session.repository';
import { ChargerRepository } from '../../../database/repositories/charger/charger.repository';
import { ChargingTelemetryPort } from '../../../integrations/http/charging-telemetry/charging-telemetry.port';
import { PaymentTransactionRepository } from '../../../database/repositories/payment-transaction/payment-transaction.repository';
import { ConflictException, NotFoundException } from '@nestjs/common';
import {
  ChargerSessionStatusEnum,
  TransactionStatusEnum,
  PaymentMethodEnum,
} from '../../../common/enums';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('StopSessionService', () => {
  let service: StopSessionService;
  let chargerSessionRepository: any;
  let chargerRepository: any;
  let telemetryPort: any;
  let paymentTransactionRepository: any;

  beforeEach(async () => {
    chargerSessionRepository = {
      findById: vi.fn(),
      complete: vi.fn(),
    };

    chargerRepository = {
      findById: vi.fn(),
    };

    telemetryPort = {
      getChargingTelemetry: vi.fn(),
      stopCharging: vi.fn(),
    };

    paymentTransactionRepository = {
      create: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StopSessionService,
        {
          provide: ChargerSessionRepository,
          useValue: chargerSessionRepository,
        },
        { provide: ChargerRepository, useValue: chargerRepository },
        { provide: ChargingTelemetryPort, useValue: telemetryPort },
        {
          provide: PaymentTransactionRepository,
          useValue: paymentTransactionRepository,
        },
      ],
    }).compile();

    service = module.get<StopSessionService>(StopSessionService);
  });

  describe('execute', () => {
    const input = {
      paymentMethodId: PaymentMethodEnum.CREDIT_CARD,
    };
    const userId = 'user-1';
    const sessionId = 'session-1';

    it('should throw NotFoundException if session not found', async () => {
      chargerSessionRepository.findById.mockResolvedValue(null);

      await expect(service.execute(userId, sessionId, input)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if session belongs to another user', async () => {
      chargerSessionRepository.findById.mockResolvedValue({
        id: sessionId,
        userId: 'other-user',
      });

      await expect(service.execute(userId, sessionId, input)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if session is not active', async () => {
      chargerSessionRepository.findById.mockResolvedValue({
        id: sessionId,
        userId,
        statusId: ChargerSessionStatusEnum.COMPLETED,
      });

      await expect(service.execute(userId, sessionId, input)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ConflictException if telemetry data returns null', async () => {
      chargerSessionRepository.findById.mockResolvedValue({
        id: sessionId,
        userId,
        statusId: ChargerSessionStatusEnum.CHARGING,
      });
      telemetryPort.getChargingTelemetry.mockResolvedValue(null);

      await expect(service.execute(userId, sessionId, input)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ConflictException if telemetry stopCharging returns false', async () => {
      chargerSessionRepository.findById.mockResolvedValue({
        id: sessionId,
        userId,
        statusId: ChargerSessionStatusEnum.CHARGING,
        chargerId: 'charger-1',
      });
      telemetryPort.getChargingTelemetry.mockResolvedValue({
        energyDeliveredKwh: 10,
      });
      telemetryPort.stopCharging.mockResolvedValue(false);

      await expect(service.execute(userId, sessionId, input)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should stop session, create transaction and return info on success', async () => {
      chargerSessionRepository.findById.mockResolvedValue({
        id: sessionId,
        userId,
        statusId: ChargerSessionStatusEnum.CHARGING,
        chargerId: 'charger-1',
      });
      telemetryPort.getChargingTelemetry.mockResolvedValue({
        energyDeliveredKwh: 10,
      });
      telemetryPort.stopCharging.mockResolvedValue(true);
      chargerRepository.findById.mockResolvedValue({
        id: 'charger-1',
        pricePerKwhCents: 150,
      });

      const completedSession = {
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
      chargerSessionRepository.complete.mockResolvedValue(completedSession);

      const result = await service.execute(userId, sessionId, input);

      expect(chargerSessionRepository.complete).toHaveBeenCalledWith(
        sessionId,
        {
          consumedAmountCents: 1500, // 10 * 150
          energyDeliveredKwh: 10,
          finishedAt: expect.any(Date),
        },
      );

      expect(paymentTransactionRepository.create).toHaveBeenCalledWith({
        userId,
        chargerSessionId: sessionId,
        amountCents: 1500,
        statusId: TransactionStatusEnum.PENDING,
        idempotencyKey: `stop_session_${sessionId}`,
        paymentMethodId: input.paymentMethodId,
        finalAmountCents: 1500,
      });

      expect(result).toHaveProperty('id', sessionId);
      expect(result.consumedAmountCents).toBe(1500);
      expect(result.statusId).toBe(ChargerSessionStatusEnum.COMPLETED);
    });

    it('should use default price 85 if charger is not found', async () => {
      chargerSessionRepository.findById.mockResolvedValue({
        id: sessionId,
        userId,
        statusId: ChargerSessionStatusEnum.CHARGING,
        chargerId: 'charger-missing',
      });
      telemetryPort.getChargingTelemetry.mockResolvedValue({
        energyDeliveredKwh: 10,
      });
      telemetryPort.stopCharging.mockResolvedValue(true);
      chargerRepository.findById.mockResolvedValue(null);

      chargerSessionRepository.complete.mockResolvedValue({
        id: sessionId,
        userId,
        chargerId: 'charger-missing',
        statusId: ChargerSessionStatusEnum.COMPLETED,
        consumedAmountCents: 850,
        energyDeliveredKwh: 10,
      });

      await service.execute(userId, sessionId, input);

      expect(chargerSessionRepository.complete).toHaveBeenCalledWith(
        sessionId,
        {
          consumedAmountCents: 850, // 10 * 85
          energyDeliveredKwh: 10,
          finishedAt: expect.any(Date),
        },
      );
    });

    it('should not create a payment transaction if amount is 0', async () => {
      chargerSessionRepository.findById.mockResolvedValue({
        id: sessionId,
        userId,
        statusId: ChargerSessionStatusEnum.CHARGING,
        chargerId: 'charger-1',
      });
      telemetryPort.getChargingTelemetry.mockResolvedValue({
        energyDeliveredKwh: 0,
      });
      telemetryPort.stopCharging.mockResolvedValue(true);
      chargerRepository.findById.mockResolvedValue({
        id: 'charger-1',
        pricePerKwhCents: 150,
      });

      chargerSessionRepository.complete.mockResolvedValue({
        id: sessionId,
        userId,
        chargerId: 'charger-1',
        statusId: ChargerSessionStatusEnum.COMPLETED,
        consumedAmountCents: 0,
        energyDeliveredKwh: 0,
      });

      await service.execute(userId, sessionId, input);

      expect(paymentTransactionRepository.create).not.toHaveBeenCalled();
    });
  });
});
