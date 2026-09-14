import { Test, TestingModule } from '@nestjs/testing';
import { SetActiveVehicleService } from './set-active-vehicle.service';
import { VehicleRepository } from '../../../database/repositories/vehicle/vehicle.repository';
import { NotFoundException } from '@nestjs/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('SetActiveVehicleService', () => {
  let service: SetActiveVehicleService;
  let vehicleRepository: any;

  beforeEach(async () => {
    vehicleRepository = {
      findById: vi.fn(),
      setActive: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SetActiveVehicleService,
        { provide: VehicleRepository, useValue: vehicleRepository },
      ],
    }).compile();

    service = module.get<SetActiveVehicleService>(SetActiveVehicleService);
  });

  describe('execute', () => {
    const userId = 'user-1';
    const vehicleId = 'vehicle-1';

    it('should throw NotFoundException if vehicle is not found', async () => {
      vehicleRepository.findById.mockResolvedValue(null);

      await expect(service.execute(userId, vehicleId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if vehicle belongs to another user', async () => {
      vehicleRepository.findById.mockResolvedValue({
        id: vehicleId,
        userId: 'other-user',
      });

      await expect(service.execute(userId, vehicleId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should set vehicle as active on success', async () => {
      vehicleRepository.findById.mockResolvedValue({
        id: vehicleId,
        userId: userId,
      });

      await service.execute(userId, vehicleId);

      expect(vehicleRepository.setActive).toHaveBeenCalledWith(
        userId,
        vehicleId,
      );
    });
  });
});
