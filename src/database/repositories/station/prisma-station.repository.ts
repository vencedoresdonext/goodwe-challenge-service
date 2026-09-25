import { StationDTO } from './dto/station.dto';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { StationRepository } from './station.repository';
import { CreateStationDTO } from './dto/create-station.dto';
import { ConnectorStatusEnum } from 'src/common/enums';

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
        contractedDemandKw: true,
        currentConsumptionKw: true,
        currentSolarGenerationKw: true,
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
        contractedDemandKw: true,
        currentConsumptionKw: true,
        currentSolarGenerationKw: true,
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
        contractedDemandKw,
        currentConsumptionKw,
        currentSolarGenerationKw,
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

  async findByChargerOwner(userId: string): Promise<StationDTO[]> {
    return this.prisma.station.findMany({
      where: {
        connectors: {
          some: {
            charger: {
              receiverUserId: userId,
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        address: true,
        latitude: true,
        longitude: true,
        pricePerKwhCents: true,
        contractedDemandKw: true,
        currentConsumptionKw: true,
        currentSolarGenerationKw: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        connectors: {
          where: {
            charger: {
              receiverUserId: userId,
            },
          },
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

  async findByIdFilteredByOwner(
    stationId: string,
    userId: string,
  ): Promise<StationDTO | null> {
    return this.prisma.station.findUnique({
      where: { id: stationId },
      select: {
        id: true,
        name: true,
        address: true,
        latitude: true,
        longitude: true,
        pricePerKwhCents: true,
        contractedDemandKw: true,
        currentConsumptionKw: true,
        currentSolarGenerationKw: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        connectors: {
          where: {
            charger: {
              receiverUserId: userId,
            },
          },
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

  async create(data: CreateStationDTO): Promise<StationDTO> {
    return this.prisma.$transaction(async (tx) => {
      const station = await tx.station.create({
        data: {
          name: data.name,
          address: data.address,
          latitude: data.latitude,
          longitude: data.longitude,
          pricePerKwhCents: data.pricePerKwhCents,
          contractedDemandKw: data.contractedDemandKw,
          currentConsumptionKw: 0,
          currentSolarGenerationKw: 0,
          isActive: true,
        },
      });

      const charger = await tx.charger.create({
        data: {
          receiverUserId: data.ownerUserId,
          pricePerKwhCents: data.pricePerKwhCents,
        },
      });

      const connector = await tx.stationConnector.create({
        data: {
          stationId: station.id,
          chargerId: charger.id,
          connectorType: data.connectorType,
          maxPowerKw: data.maxPowerKw,
          statusId: ConnectorStatusEnum.AVAILABLE,
        },
      });

      return {
        id: station.id,
        name: station.name,
        address: station.address,
        latitude: station.latitude,
        longitude: station.longitude,
        pricePerKwhCents: station.pricePerKwhCents,
        contractedDemandKw: station.contractedDemandKw,
        currentConsumptionKw: station.currentConsumptionKw,
        currentSolarGenerationKw: station.currentSolarGenerationKw,
        isActive: station.isActive,
        createdAt: station.createdAt,
        updatedAt: station.updatedAt,
        connectors: [
          {
            id: connector.id,
            stationId: connector.stationId,
            chargerId: connector.chargerId,
            connectorType: connector.connectorType,
            maxPowerKw: connector.maxPowerKw,
            statusId: connector.statusId,
            createdAt: connector.createdAt,
            updatedAt: connector.updatedAt,
          },
        ],
      };
    });
  }
}
