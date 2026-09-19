import { Injectable, NotFoundException } from '@nestjs/common';
import { StationRepository } from '../../../database/repositories/station/station.repository';
import { StationOutputDTO } from '../dto/io/station-io.dto';

@Injectable()
export class FindStationDetailWebService {
  constructor(private readonly stationRepository: StationRepository) {}

  async execute(stationId: string, userId: string): Promise<StationOutputDTO> {
    const station = await this.stationRepository.findByIdFilteredByOwner(
      stationId,
      userId,
    );

    if (!station) {
      throw new NotFoundException('Estação não encontrada.');
    }

    return {
      id: station.id,
      name: station.name,
      latitude: station.latitude,
      longitude: station.longitude,
      address: station.address,
      pricePerKwh: station.pricePerKwhCents / 100,
      contractedDemandKw: station.contractedDemandKw,
      currentConsumptionKw: station.currentConsumptionKw,
      currentSolarGenerationKw: station.currentSolarGenerationKw,
      isActive: station.isActive,
      connectors: station.connectors
        ? station.connectors.map((c) => ({
            id: c.id,
            chargerId: c.chargerId,
            connectorType: c.connectorType,
            maxPowerKw: c.maxPowerKw,
            statusId: c.statusId,
          }))
        : [],
    };
  }
}
