import { Test, TestingModule } from '@nestjs/testing';
import { FindStationDetailService } from './find-station-detail.service';
import { StationRepository } from '../../../database/repositories/station/station.repository';
import { NotFoundException } from '@nestjs/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('FindStationDetailService', () => {
  let service: FindStationDetailService;
  let stationRepository: any;

  beforeEach(async () => {
    stationRepository = {
      findById: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindStationDetailService,
        { provide: StationRepository, useValue: stationRepository },
      ],
    }).compile();

    service = module.get<FindStationDetailService>(FindStationDetailService);
  });

  describe('execute', () => {
    it('should throw NotFoundException if station is not found', async () => {
      stationRepository.findById.mockResolvedValue(null);

      await expect(service.execute('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(stationRepository.findById).toHaveBeenCalledWith(
        'non-existent-id',
      );
    });

    it('should return station details and map pricePerKwh correctly', async () => {
      stationRepository.findById.mockResolvedValue({
        id: '1',
        name: 'Station 1',
        latitude: 10,
        longitude: 20,
        address: 'Address 1',
        pricePerKwhCents: 150,
        isActive: true,
      });

      const result = await service.execute('1');

      expect(result).toEqual({
        id: '1',
        name: 'Station 1',
        latitude: 10,
        longitude: 20,
        address: 'Address 1',
        pricePerKwh: 1.5,
        isActive: true,
        connectors: [],
      });
    });

    it('should map connectors correctly if they exist', async () => {
      stationRepository.findById.mockResolvedValue({
        id: '1',
        name: 'Station 1',
        latitude: 10,
        longitude: 20,
        address: 'Address 1',
        pricePerKwhCents: 150,
        isActive: true,
        connectors: [
          {
            id: 'c1',
            chargerId: 'ch1',
            connectorType: 'TYPE_2',
            maxPowerKw: 22,
            statusId: 'AVAILABLE',
          },
        ],
      });

      const result = await service.execute('1');

      expect(result.connectors).toHaveLength(1);
      expect(result.connectors?.[0]).toEqual({
        id: 'c1',
        chargerId: 'ch1',
        connectorType: 'TYPE_2',
        maxPowerKw: 22,
        statusId: 'AVAILABLE',
      });
    });
  });
});
