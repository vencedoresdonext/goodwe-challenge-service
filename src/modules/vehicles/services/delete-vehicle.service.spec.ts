import { Test, TestingModule } from '@nestjs/testing';
import { DeleteVehicleService } from './delete-vehicle.service';
import { VehicleRepository } from '../../../database/repositories/vehicle/vehicle.repository';
import { NotFoundException } from '@nestjs/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('DeleteVehicleService', () => {
  let service: DeleteVehicleService;
  let vehicleRepository: any;

  beforeEach(async () => {
    vehicleRepository = {
      findById: vi.fn(),
      delete: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteVehicleService,
        { provide: VehicleRepository, useValue: vehicleRepository },
      ],
    }).compile();

    service = module.get<DeleteVehicleService>(DeleteVehicleService);
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

    it('should delete the vehicle on success', async () => {
      vehicleRepository.findById.mockResolvedValue({
        id: vehicleId,
        userId: userId,
      });

      await service.execute(userId, vehicleId);

      expect(vehicleRepository.delete).toHaveBeenCalledWith(vehicleId);
    });
  });
});
