import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateChargerWebService } from './update-charger-web.service';

describe('UpdateChargerWebService', () => {
  let service: UpdateChargerWebService;
  let stationRepository: any;
  let sessionRepository: any;

  const connector = {
    id: 'conn-1',
    stationId: 'st-1',
    chargerId: 'ch-1',
    connectorType: 'TYPE2',
    maxPowerKw: 22,
    statusId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    charger: {
      receiverUserId: 'user-1',
      receiverCardId: null,
      pricePerKwhCents: 89,
    },
  };

  beforeEach(() => {
    stationRepository = {
      findConnectorByChargerId: vi.fn().mockResolvedValue(connector),
      updateCharger: vi.fn().mockImplementation((_id, data) =>
        Promise.resolve({
          ...connector,
          ...Object.fromEntries(
            Object.entries(data).filter(([, v]) => v !== undefined),
          ),
          charger: {
            ...connector.charger,
            pricePerKwhCents: data.pricePerKwhCents ?? 89,
          },
        }),
      ),
    };
    sessionRepository = {
      findActiveByChargerId: vi.fn().mockResolvedValue(null),
    };
    service = new UpdateChargerWebService(stationRepository, sessionRepository);
  });

  it('rejects an empty body', async () => {
    await expect(service.execute('user-1', 'ch-1', {})).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throws when the charger does not exist', async () => {
    stationRepository.findConnectorByChargerId.mockResolvedValue(null);
    await expect(
      service.execute('user-1', 'ch-1', { maxPowerKw: 11 }),
    ).rejects.toThrow(NotFoundException);
  });

  it('forbids editing chargers from other users', async () => {
    await expect(
      service.execute('user-2', 'ch-1', { maxPowerKw: 11 }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('blocks status changes while a session is running', async () => {
    sessionRepository.findActiveByChargerId.mockResolvedValue({ id: 's1' });
    await expect(
      service.execute('user-1', 'ch-1', { statusId: 3 }),
    ).rejects.toThrow(ConflictException);
  });

  it('converts the price to cents and returns the connector in reais', async () => {
    const result = await service.execute('user-1', 'ch-1', {
      pricePerKwh: 1.25,
      connectorType: 'CCS2',
    });
    expect(stationRepository.updateCharger).toHaveBeenCalledWith('ch-1', {
      connectorType: 'CCS2',
      maxPowerKw: undefined,
      pricePerKwhCents: 125,
      statusId: undefined,
    });
    expect(result.pricePerKwh).toBe(1.25);
    expect(result.connectorType).toBe('CCS2');
  });
});
