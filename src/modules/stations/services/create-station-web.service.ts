import { Injectable } from '@nestjs/common';
import { StationOutputDTO } from '../dto/io/station-io.dto';
import { CreateStationInputDTO } from '../dto/io/create-station.dto';
import { StationRepository } from 'src/database/repositories/station';
import {
  reaisToCents,
  toStationOutput,
} from '../mappers/station-output.mapper';

@Injectable()
export class CreateStationWebService {
  constructor(private readonly stationRepository: StationRepository) {}

  async execute(
    userId: string,
    input: CreateStationInputDTO,
  ): Promise<StationOutputDTO> {
    const stationPriceCents = reaisToCents(input.pricePerKwh);

    const station = await this.stationRepository.create({
      name: input.name.trim(),
      address: input.address.trim(),
      latitude: input.latitude,
      longitude: input.longitude,
      pricePerKwhCents: stationPriceCents,
      contractedDemandKw: input.contractedDemandKw,
      ownerUserId: userId,
      chargers: input.chargers.map((charger) => ({
        connectorType: charger.connectorType,
        maxPowerKw: charger.maxPowerKw,
        // Sem preço próprio, o carregador herda o preço da station
        pricePerKwhCents:
          charger.pricePerKwh != null
            ? reaisToCents(charger.pricePerKwh)
            : stationPriceCents,
      })),
    });

    return toStationOutput(station);
  }
}
