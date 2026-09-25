import { Injectable } from '@nestjs/common';
import { StationRepository } from '../../../database/repositories/station/station.repository';
import { StationOutputDTO } from '../dto/io/station-io.dto';
import { toStationOutput } from '../mappers/station-output.mapper';

@Injectable()
export class FindManyStationsWebService {
  constructor(private readonly stationRepository: StationRepository) {}

  async execute(userId: string): Promise<StationOutputDTO[]> {
    const stations = await this.stationRepository.findByChargerOwner(userId);
    return stations.map(toStationOutput);
  }
}
