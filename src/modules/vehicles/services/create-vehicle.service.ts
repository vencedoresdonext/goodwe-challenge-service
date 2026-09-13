import { Injectable, ConflictException } from '@nestjs/common';
import { VehicleRepository } from '../../../database/repositories/vehicle/vehicle.repository';
import { CreateVehicleRequestDTO } from '../dto/request/create-vehicle-request.dto';
import { VehicleOutputDTO } from '../dto/io/vehicle-io.dto';

@Injectable()
export class CreateVehicleService {
  constructor(private readonly vehicleRepository: VehicleRepository) {}

  async execute(
    userId: string,
    input: CreateVehicleRequestDTO,
  ): Promise<VehicleOutputDTO> {
    const existingVehicle = await this.vehicleRepository.findByPlateAndUser(
      input.plate,
      userId,
    );

    if (existingVehicle) {
      throw new ConflictException(
        'Vehicle with this plate already exists for this user.',
      );
    }

    const existingVehicles = await this.vehicleRepository.findByUserId(userId);
    const isActive = existingVehicles.length === 0;

    const newVehicle = await this.vehicleRepository.create({
      userId,
      plate: input.plate,
      brand: input.brand,
      model: input.model,
      icon: input.icon,
      isActive,
    });

    return {
      id: newVehicle.id,
      plate: newVehicle.plate,
      brand: newVehicle.brand,
      model: newVehicle.model,
      icon: newVehicle.icon,
      isActive: newVehicle.isActive,
      createdAt: newVehicle.createdAt,
    };
  }
}
