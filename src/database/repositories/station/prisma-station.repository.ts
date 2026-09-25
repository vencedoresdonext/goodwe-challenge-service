import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma.service';
import { StationRepository } from './station.repository';
import { StationDTO } from './dto/station.dto';
import { StationConnectorDTO } from './dto/station-connector.dto';
import {
  CreateStationChargerDTO,
  CreateStationDTO,
} from './dto/create-station.dto';
import { UpdateStationChargerDTO } from './dto/update-station-charger.dto';
import { ConnectorStatusEnum } from 'src/common/enums';

const connectorSelect = {
  id: true,
  stationId: true,
  chargerId: true,
  connectorType: true,
  maxPowerKw: true,
  statusId: true,
  createdAt: true,
  updatedAt: true,
  charger: {
    select: {
      receiverUserId: true,
      receiverCardId: true,
      pricePerKwhCents: true,
    },
  },
} satisfies Prisma.StationConnectorSelect;

const connectorOrder = {
  createdAt: 'asc',
} satisfies Prisma.StationConnectorOrderByWithRelationInput;

const stationScalarSelect = {
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
} satisfies Prisma.StationSelect;

function stationSelect(
  connectorsWhere?: Prisma.StationConnectorWhereInput,
): Prisma.StationSelect {
  return {
    ...stationScalarSelect,
    connectors: {
      where: connectorsWhere,
      orderBy: connectorOrder,
      select: connectorSelect,
    },
  };
}

const ownedBy = (userId: string): Prisma.StationConnectorWhereInput => ({
  charger: { receiverUserId: userId },
});

@Injectable()
export class PrismaStationRepository implements StationRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(filters?: { isActive?: boolean }): Promise<StationDTO[]> {
    return this.prisma.station.findMany({
      where: filters,
      select: stationSelect(),
    });
  }

  findById(id: string): Promise<StationDTO | null> {
    return this.prisma.station.findUnique({
      where: { id },
      select: stationSelect(),
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

  findByChargerOwner(userId: string): Promise<StationDTO[]> {
    return this.prisma.station.findMany({
      where: { connectors: { some: ownedBy(userId) } },
      orderBy: { createdAt: 'asc' },
      select: stationSelect(ownedBy(userId)),
    });
  }

  findByIdFilteredByOwner(
    stationId: string,
    userId: string,
  ): Promise<StationDTO | null> {
    return this.prisma.station.findUnique({
      where: { id: stationId },
      select: stationSelect(ownedBy(userId)),
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
        select: stationScalarSelect,
      });

      const connectors: StationConnectorDTO[] = [];
      for (const charger of data.chargers) {
        connectors.push(
          await this.createConnector(tx, station.id, data.ownerUserId, charger),
        );
      }

      return { ...station, connectors };
    });
  }

  addCharger(
    stationId: string,
    ownerUserId: string,
    data: CreateStationChargerDTO,
  ): Promise<StationConnectorDTO> {
    return this.prisma.$transaction((tx) =>
      this.createConnector(tx, stationId, ownerUserId, data),
    );
  }

  findConnectorByChargerId(
    chargerId: string,
  ): Promise<StationConnectorDTO | null> {
    return this.prisma.stationConnector.findUnique({
      where: { chargerId },
      select: connectorSelect,
    });
  }

  async updateCharger(
    chargerId: string,
    data: UpdateStationChargerDTO,
  ): Promise<StationConnectorDTO> {
    return this.prisma.$transaction(async (tx) => {
      if (data.pricePerKwhCents !== undefined) {
        await tx.charger.update({
          where: { id: chargerId },
          data: { pricePerKwhCents: data.pricePerKwhCents },
        });
      }

      return tx.stationConnector.update({
        where: { chargerId },
        data: {
          connectorType: data.connectorType,
          maxPowerKw: data.maxPowerKw,
          statusId: data.statusId,
        },
        select: connectorSelect,
      });
    });
  }

  private async createConnector(
    tx: Prisma.TransactionClient,
    stationId: string,
    ownerUserId: string,
    data: CreateStationChargerDTO,
  ): Promise<StationConnectorDTO> {
    const charger = await tx.charger.create({
      data: {
        receiverUserId: ownerUserId,
        pricePerKwhCents: data.pricePerKwhCents,
      },
      select: { id: true },
    });

    return tx.stationConnector.create({
      data: {
        stationId,
        chargerId: charger.id,
        connectorType: data.connectorType,
        maxPowerKw: data.maxPowerKw,
        statusId: ConnectorStatusEnum.AVAILABLE,
      },
      select: connectorSelect,
    });
  }
}
