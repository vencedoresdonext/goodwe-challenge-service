import { Injectable } from '@nestjs/common';
import { VehicleRepository } from '../../../database/repositories/vehicle/vehicle.repository';
import { VehicleOutputDTO } from '../dto/io/vehicle-io.dto';

@Injectable()
export class FindManyVehiclesService {
  constructor(private readonly vehicleRepository: VehicleRepository) {}

  execute(userId: string): Promise<VehicleOutputDTO[]> {
    return this.vehicleRepository.findByUserId(userId);
  }
}
