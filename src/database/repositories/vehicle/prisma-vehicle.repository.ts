import { VehicleDTO } from './dto/vehicle.dto';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { VehicleRepository } from './vehicle.repository';
import { CreateVehicleDTO } from './dto/create-vehicle.dto';

@Injectable()
export class PrismaVehicleRepository implements VehicleRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateVehicleDTO): Promise<VehicleDTO> {
    return this.prisma.vehicle.create({
      data,
    });
  }

  findById(id: string): Promise<VehicleDTO | null> {
    return this.prisma.vehicle.findUnique({
      where: { id },
    });
  }

  findByUserId(userId: string): Promise<VehicleDTO[]> {
    return this.prisma.vehicle.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findByPlateAndUser(
    plate: string,
    userId: string,
  ): Promise<VehicleDTO | null> {
    return this.prisma.vehicle.findUnique({
      where: {
        userId_plate: {
          userId,
          plate,
        },
      },
    });
  }

  async setActive(userId: string, vehicleId: string): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.vehicle.updateMany({
        where: { userId },
        data: { isActive: false },
      }),
      this.prisma.vehicle.update({
        where: { id: vehicleId, userId },
        data: { isActive: true },
      }),
    ]);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.vehicle.delete({
      where: { id },
    });
  }
}
