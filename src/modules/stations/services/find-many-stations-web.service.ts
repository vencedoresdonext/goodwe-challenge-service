import { Injectable } from '@nestjs/common';
import { StationRepository } from '../../../database/repositories/station/station.repository';
import { StationOutputDTO } from '../dto/io/station-io.dto';

@Injectable()
export class FindManyStationsWebService {
  constructor(private readonly stationRepository: StationRepository) {}

  async execute(userId: string): Promise<StationOutputDTO[]> {
    const stations = await this.stationRepository.findByChargerOwner(userId);

    return stations.map((s) => ({
      id: s.id,
      name: s.name,
      latitude: s.latitude,
      longitude: s.longitude,
      address: s.address,
      pricePerKwh: s.pricePerKwhCents / 100,
      contractedDemandKw: s.contractedDemandKw,
      currentConsumptionKw: s.currentConsumptionKw,
      currentSolarGenerationKw: s.currentSolarGenerationKw,
      isActive: s.isActive,
      connectors: s.connectors
        ? s.connectors.map((c) => ({
            id: c.id,
            chargerId: c.chargerId,
            connectorType: c.connectorType,
            maxPowerKw: c.maxPowerKw,
            statusId: c.statusId,
          }))
        : [],
    }));
  }
}
