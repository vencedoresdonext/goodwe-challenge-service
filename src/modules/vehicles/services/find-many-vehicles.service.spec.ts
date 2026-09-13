import { Test, TestingModule } from '@nestjs/testing';
import { FindManyVehiclesService } from './find-many-vehicles.service';
import { VehicleRepository } from '../../../database/repositories/vehicle/vehicle.repository';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('FindManyVehiclesService', () => {
  let service: FindManyVehiclesService;
  let vehicleRepository: any;

  beforeEach(async () => {
    vehicleRepository = {
      findByUserId: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindManyVehiclesService,
        { provide: VehicleRepository, useValue: vehicleRepository },
      ],
    }).compile();

    service = module.get<FindManyVehiclesService>(FindManyVehiclesService);
  });

  describe('execute', () => {
    const userId = 'user-1';

    it('should return empty array if user has no vehicles', async () => {
      vehicleRepository.findByUserId.mockResolvedValue([]);

      const result = await service.execute(userId);

      expect(vehicleRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(result).toEqual([]);
    });

    it('should return user vehicles on success', async () => {
      const mockDate = new Date('2023-01-01');
      const vehicles = [
        {
          id: 'vehicle-1',
          plate: 'ABC1234',
          brand: 'Tesla',
          model: 'Model 3',
          icon: 'car_icon',
          isActive: true,
          createdAt: mockDate,
        },
      ];
      vehicleRepository.findByUserId.mockResolvedValue(vehicles);

      const result = await service.execute(userId);

      expect(vehicleRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(result).toEqual(vehicles);
    });
  });
});
