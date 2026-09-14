import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { ChargerSessionRepository } from '../../../database/repositories/charger-session/charger-session.repository';
import { ChargerRepository } from '../../../database/repositories/charger/charger.repository';
import { ChargingTelemetryPort } from '../../../integrations/http/charging-telemetry/charging-telemetry.port';
import { StartSessionRequestDTO } from '../dto/request/start-session-request.dto';
import { ChargingSessionOutputDTO } from '../dto/io/charging-session-io.dto';
import { ChargerSessionStatusEnum } from '../../../common/enums';

@Injectable()
export class StartSessionService {
  constructor(
    private readonly chargerSessionRepository: ChargerSessionRepository,
    private readonly chargerRepository: ChargerRepository,
    private readonly telemetryPort: ChargingTelemetryPort,
  ) {}

  async execute(
    userId: string,
    input: StartSessionRequestDTO,
  ): Promise<ChargingSessionOutputDTO> {
    const charger = await this.chargerRepository.findById(input.chargerId);
    if (!charger) {
      throw new NotFoundException('Carregador não encontrado.');
    }

    const activeSession =
      await this.chargerSessionRepository.findActiveByChargerId(
        input.chargerId,
      );
    if (activeSession) {
      throw new ConflictException('O carregador já está em uso.');
    }

    const userActiveSession =
      await this.chargerSessionRepository.findActiveByUserId(userId);
    if (userActiveSession) {
      throw new ConflictException(
        'User already has an active charging session.',
      );
    }

    const telemetryStatus = await this.telemetryPort.getChargerStatus(
      input.chargerId,
    );
    if (!telemetryStatus) {
      throw new ConflictException(
        'Falha ao conectar à telemetria do carregador.',
      );
    }
    if (telemetryStatus.connectorStatus !== 'AVAILABLE') {
      throw new ConflictException(
        'Charger is not available according to telemetry.',
      );
    }

    const started = await this.telemetryPort.startCharging(input.chargerId);
    if (started === null || started === false) {
      throw new ConflictException(
        'Falha ao iniciar o carregamento via telemetria.',
      );
    }

    const session = await this.chargerSessionRepository.create({
      userId,
      vehicleId: input.vehicleId || null,
      chargerId: input.chargerId,
      statusId: ChargerSessionStatusEnum.CHARGING,
      preAuthorizedAmountCents: input.preAuthorizedAmountCents,
    });

    return {
      id: session.id,
      userId: session.userId,
      vehicleId: session.vehicleId || null,
      chargerId: session.chargerId,
      statusId: session.statusId,
      consumedAmountCents: session.consumedAmountCents,
      energyDeliveredKwh: session.energyDeliveredKwh,
      startedAt: session.startedAt || new Date(),
      finishedAt: session.finishedAt || null,
    };
  }
}
