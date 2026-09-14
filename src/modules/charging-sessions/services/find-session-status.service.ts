import { Injectable, NotFoundException } from '@nestjs/common';

import { ChargingSessionOutputDTO } from '../dto/io/charging-session-io.dto';
import { ChargerSessionStatusEnum } from '../../../common/enums';
import { ChargerSessionRepository } from '../../../database/repositories';
import {
  ChargingTelemetry,
  ChargingTelemetryPort,
} from '../../../integrations/http/charging-telemetry/charging-telemetry.port';

@Injectable()
export class FindSessionStatusService {
  constructor(
    private readonly chargerSessionRepository: ChargerSessionRepository,
    private readonly telemetryPort: ChargingTelemetryPort,
  ) {}

  async execute(
    userId: string,
    sessionId: string,
  ): Promise<ChargingSessionOutputDTO> {
    const session = await this.chargerSessionRepository.findById(sessionId);
    if (!session || session.userId !== userId) {
      throw new NotFoundException('Sessão não encontrada.');
    }

    let telemetryData: ChargingTelemetry | null = null;

    if (session.statusId === ChargerSessionStatusEnum.CHARGING) {
      telemetryData = await this.telemetryPort.getChargingTelemetry(sessionId);
    }

    return {
      id: session.id,
      userId: session.userId,
      vehicleId: session.vehicleId || null,
      chargerId: session.chargerId,
      statusId: session.statusId,
      consumedAmountCents: session.consumedAmountCents,
      energyDeliveredKwh: telemetryData
        ? telemetryData.energyDeliveredKwh
        : session.energyDeliveredKwh,
      startedAt: session.startedAt || new Date(),
      finishedAt: session.finishedAt || null,
      telemetry: telemetryData
        ? {
            powerKw: telemetryData.powerKw,
            batteryPercentage: telemetryData.batteryPercentage,
            estimatedTimeLeftMinutes: telemetryData.estimatedTimeLeftMinutes,
          }
        : undefined,
    };
  }
}
