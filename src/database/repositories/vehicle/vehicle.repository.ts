import { VehicleDTO } from './dto/vehicle.dto';
import { CreateVehicleDTO } from './dto/create-vehicle.dto';

export abstract class VehicleRepository {
  abstract create(data: CreateVehicleDTO): Promise<VehicleDTO>;
  abstract findById(id: string): Promise<VehicleDTO | null>;
  abstract findByUserId(userId: string): Promise<VehicleDTO[]>;
  abstract findByPlateAndUser(
    plate: string,
    userId: string,
  ): Promise<VehicleDTO | null>;
  abstract setActive(userId: string, vehicleId: string): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
