import { Injectable } from '@nestjs/common';
import { StationRepository } from '../../../database/repositories/station/station.repository';
import { FindManyStationsQueryParamsDTO } from '../dto/query-params/find-many-stations-query-params.dto';
import { StationOutputDTO } from '../dto/io/station-io.dto';

@Injectable()
export class FindManyStationsService {
  constructor(private readonly stationRepository: StationRepository) {}

  async execute(
    query: FindManyStationsQueryParamsDTO,
  ): Promise<StationOutputDTO[]> {
    const radius = query.radiusKm || 10;
    const stations = await this.stationRepository.findNearby(
      query.latitude,
      query.longitude,
      radius,
    );

    return stations.map((s) => ({
      id: s.id,
      name: s.name,
      latitude: s.latitude,
      longitude: s.longitude,
      address: s.address,
      pricePerKwh: s.pricePerKwhCents / 100,
      isActive: s.isActive,
      distance: s.distance,
    }));
  }
}
