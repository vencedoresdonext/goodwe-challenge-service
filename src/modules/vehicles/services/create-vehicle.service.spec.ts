import { Test, TestingModule } from '@nestjs/testing';
import { CreateVehicleService } from './create-vehicle.service';
import { VehicleRepository } from '../../../database/repositories/vehicle/vehicle.repository';
import { ConflictException } from '@nestjs/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('CreateVehicleService', () => {
  let service: CreateVehicleService;
  let vehicleRepository: any;

  beforeEach(async () => {
    vehicleRepository = {
      findByPlateAndUser: vi.fn(),
      findByUserId: vi.fn(),
      create: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateVehicleService,
        { provide: VehicleRepository, useValue: vehicleRepository },
      ],
    }).compile();

    service = module.get<CreateVehicleService>(CreateVehicleService);
  });

  describe('execute', () => {
    const userId = 'user-1';
    const input = {
      plate: 'ABC1234',
      brand: 'Tesla',
      model: 'Model 3',
      icon: 'car_icon',
    };

    it('should throw ConflictException if vehicle with plate already exists', async () => {
      vehicleRepository.findByPlateAndUser.mockResolvedValue({
        id: 'vehicle-1',
      });

      await expect(service.execute(userId, input)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should set isActive to true if it is the first vehicle', async () => {
      vehicleRepository.findByPlateAndUser.mockResolvedValue(null);
      vehicleRepository.findByUserId.mockResolvedValue([]);

      const mockDate = new Date('2023-01-01');
      vehicleRepository.create.mockResolvedValue({
        id: 'vehicle-new',
        ...input,
        isActive: true,
        createdAt: mockDate,
      });

      const result = await service.execute(userId, input);

      expect(vehicleRepository.create).toHaveBeenCalledWith({
        userId,
        plate: input.plate,
        brand: input.brand,
        model: input.model,
        icon: input.icon,
        isActive: true,
      });

      expect(result).toEqual({
        id: 'vehicle-new',
        ...input,
        isActive: true,
        createdAt: mockDate,
      });
    });

    it('should set isActive to false if user already has vehicles', async () => {
      vehicleRepository.findByPlateAndUser.mockResolvedValue(null);
      vehicleRepository.findByUserId.mockResolvedValue([{ id: 'vehicle-old' }]);

      const mockDate = new Date('2023-01-01');
      vehicleRepository.create.mockResolvedValue({
        id: 'vehicle-new',
        ...input,
        isActive: false,
        createdAt: mockDate,
      });

      const result = await service.execute(userId, input);

      expect(vehicleRepository.create).toHaveBeenCalledWith({
        userId,
        plate: input.plate,
        brand: input.brand,
        model: input.model,
        icon: input.icon,
        isActive: false,
      });

      expect(result.isActive).toBe(false);
    });
  });
});
