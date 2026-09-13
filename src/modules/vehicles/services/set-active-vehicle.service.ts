import { Injectable, NotFoundException } from '@nestjs/common';
import { VehicleRepository } from '../../../database/repositories/vehicle/vehicle.repository';

@Injectable()
export class SetActiveVehicleService {
  constructor(private readonly vehicleRepository: VehicleRepository) {}

  async execute(userId: string, vehicleId: string): Promise<void> {
    const vehicle = await this.vehicleRepository.findById(vehicleId);

    if (!vehicle || vehicle.userId !== userId) {
      throw new NotFoundException('Veículo não encontrado.');
    }

    await this.vehicleRepository.setActive(userId, vehicleId);
  }
}
