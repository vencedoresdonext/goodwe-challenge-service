import { StationDTO } from './dto/station.dto';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { StationRepository } from './station.repository';

@Injectable()
export class PrismaStationRepository implements StationRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(filters?: { isActive?: boolean }): Promise<StationDTO[]> {
    return this.prisma.station.findMany({
      where: filters,
      select: {
        id: true,
        name: true,
        address: true,
        latitude: true,
        longitude: true,
        pricePerKwhCents: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        connectors: {
          select: {
            id: true,
            stationId: true,
            chargerId: true,
            connectorType: true,
            maxPowerKw: true,
            statusId: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
  }

  findById(id: string): Promise<StationDTO | null> {
    return this.prisma.station.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        address: true,
        latitude: true,
        longitude: true,
        pricePerKwhCents: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        connectors: {
          select: {
            id: true,
            stationId: true,
            chargerId: true,
            connectorType: true,
            maxPowerKw: true,
            statusId: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
  }

  async findNearby(
    lat: number,
    lng: number,
    radiusKm: number,
  ): Promise<(StationDTO & { distance: number })[]> {
    const rawStations = await this.prisma.$queryRaw<any[]>`
      SELECT 
        id, 
        name, 
        address, 
        latitude, 
        longitude, 
        pricePerKwhCents, 
        isActive, 
        createdAt, 
        updatedAt, 
        (
          6371 * acos(
            cos(radians(${lat})) * 
            cos(radians(latitude)) * 
            cos(radians(longitude) - radians(${lng})) + 
            sin(radians(${lat})) * 
            sin(radians(latitude))
          )
        ) AS distance 
      FROM stations 
      WHERE isActive = true 
      HAVING distance <= ${radiusKm} 
      ORDER BY distance ASC
    `;

    return rawStations;
  }
}
