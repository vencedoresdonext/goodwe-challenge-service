import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StationRepository } from '../../../database/repositories/station/station.repository';
import { ChargerSessionRepository } from '../../../database/repositories/charger-session/charger-session.repository';
import { ConnectorStatusEnum } from '../../../common/enums';
import { ConnectorOutputDTO } from '../dto/io/station-io.dto';
import { UpdateChargerRequestDTO } from '../dto/request/update-charger-request.dto';
import {
  reaisToCents,
  toConnectorOutput,
} from '../mappers/station-output.mapper';

@Injectable()
export class UpdateChargerWebService {
  constructor(
    private readonly stationRepository: StationRepository,
    private readonly chargerSessionRepository: ChargerSessionRepository,
  ) {}

  async execute(
    userId: string,
    chargerId: string,
    input: UpdateChargerRequestDTO,
  ): Promise<ConnectorOutputDTO> {
    const hasChanges = Object.values(input).some((v) => v !== undefined);
    if (!hasChanges) {
      throw new BadRequestException('Nenhum campo para atualizar.');
    }

    const connector =
      await this.stationRepository.findConnectorByChargerId(chargerId);

    if (!connector) {
      throw new NotFoundException('Carregador não encontrado.');
    }

    if (connector.charger?.receiverUserId !== userId) {
      throw new ForbiddenException('Este carregador não pertence a você.');
    }

    const changesStatus =
      input.statusId !== undefined && input.statusId !== connector.statusId;

    if (changesStatus) {
      const activeSession =
        await this.chargerSessionRepository.findActiveByChargerId(chargerId);

      if (
        activeSession ||
        connector.statusId === Number(ConnectorStatusEnum.OCCUPIED)
      ) {
        throw new ConflictException(
          'Não é possível alterar o status com uma recarga em andamento.',
        );
      }
    }

    const updated = await this.stationRepository.updateCharger(chargerId, {
      connectorType: input.connectorType,
      maxPowerKw: input.maxPowerKw,
      pricePerKwhCents:
        input.pricePerKwh != null ? reaisToCents(input.pricePerKwh) : undefined,
      statusId: changesStatus ? input.statusId : undefined,
    });

    return toConnectorOutput(updated);
  }
}
