import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StationRepository } from '../../../database/repositories/station/station.repository';
import { ConnectorOutputDTO } from '../dto/io/station-io.dto';
import { CreateChargerRequestDTO } from '../dto/request/create-charger-request.dto';
import {
  reaisToCents,
  toConnectorOutput,
} from '../mappers/station-output.mapper';

@Injectable()
export class CreateChargerWebService {
  constructor(private readonly stationRepository: StationRepository) {}

  async execute(
    userId: string,
    stationId: string,
    input: CreateChargerRequestDTO,
  ): Promise<ConnectorOutputDTO> {
    // Os conectores já vêm filtrados pelo dono: se não sobrar nenhum,
    // a station existe mas não é deste usuário.
    const station = await this.stationRepository.findByIdFilteredByOwner(
      stationId,
      userId,
    );

    if (!station) {
      throw new NotFoundException('Estação não encontrada.');
    }

    if (!station.connectors?.length) {
      throw new ForbiddenException(
        'Você só pode adicionar carregadores em stations onde já possui carregadores.',
      );
    }

    const connector = await this.stationRepository.addCharger(
      stationId,
      userId,
      {
        connectorType: input.connectorType,
        maxPowerKw: input.maxPowerKw,
        pricePerKwhCents:
          input.pricePerKwh != null
            ? reaisToCents(input.pricePerKwh)
            : station.pricePerKwhCents,
      },
    );

    return toConnectorOutput(connector);
  }
}
