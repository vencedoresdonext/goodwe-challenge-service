import { Injectable, NotFoundException } from '@nestjs/common';
import { StationRepository } from '../../../database/repositories/station/station.repository';
import { StationOutputDTO } from '../dto/io/station-io.dto';
import { toStationOutput } from '../mappers/station-output.mapper';

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

    return toStationOutput(station);
  }
}
