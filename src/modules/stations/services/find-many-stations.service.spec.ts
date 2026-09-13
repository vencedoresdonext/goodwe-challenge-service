import { Test, TestingModule } from '@nestjs/testing';
import { FindManyStationsService } from './find-many-stations.service';
import { StationRepository } from '../../../database/repositories/station/station.repository';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('FindManyStationsService', () => {
  let service: FindManyStationsService;
  let stationRepository: any;

  beforeEach(async () => {
    stationRepository = {
      findNearby: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindManyStationsService,
        { provide: StationRepository, useValue: stationRepository },
      ],
    }).compile();

    service = module.get<FindManyStationsService>(FindManyStationsService);
  });

  describe('execute', () => {
    it('should use the provided radiusKm', async () => {
      stationRepository.findNearby.mockResolvedValue([]);

      await service.execute({
        latitude: 10,
        longitude: 20,
        radiusKm: 25,
      });

      expect(stationRepository.findNearby).toHaveBeenCalledWith(10, 20, 25);
    });

    it('should use a default radius of 10 if radiusKm is not provided', async () => {
      stationRepository.findNearby.mockResolvedValue([]);

      await service.execute({
        latitude: 10,
        longitude: 20,
      });

      expect(stationRepository.findNearby).toHaveBeenCalledWith(10, 20, 10);
    });

    it('should map the returned stations correctly', async () => {
      stationRepository.findNearby.mockResolvedValue([
        {
          id: '1',
          name: 'Station 1',
          latitude: 10,
          longitude: 20,
          address: 'Address 1',
          pricePerKwhCents: 150,
          isActive: true,
          distance: 5,
        },
      ]);

      const result = await service.execute({
        latitude: 10,
        longitude: 20,
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: '1',
        name: 'Station 1',
        latitude: 10,
        longitude: 20,
        address: 'Address 1',
        pricePerKwh: 1.5,
        isActive: true,
        distance: 5,
      });
    });
  });
});
