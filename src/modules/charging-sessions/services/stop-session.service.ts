import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ChargerSessionRepository } from '../../../database/repositories/charger-session/charger-session.repository';
import { ChargerRepository } from '../../../database/repositories/charger/charger.repository';
import { ChargingTelemetryPort } from '../../../integrations/http/charging-telemetry/charging-telemetry.port';
import { ChargingSessionOutputDTO } from '../dto/io/charging-session-io.dto';
import {
  ChargerSessionStatusEnum,
  TransactionStatusEnum,
} from '../../../common/enums';
import { PaymentTransactionRepository } from '../../../database/repositories/payment-transaction/payment-transaction.repository';
import { StopSessionRequestDTO } from '../dto/request/stop-session-request.dto';

@Injectable()
export class StopSessionService {
  constructor(
    private readonly chargerSessionRepository: ChargerSessionRepository,
    private readonly chargerRepository: ChargerRepository,
    private readonly telemetryPort: ChargingTelemetryPort,
    private readonly paymentTransactionRepository: PaymentTransactionRepository,
  ) {}

  async execute(
    userId: string,
    sessionId: string,
    input: StopSessionRequestDTO,
  ): Promise<ChargingSessionOutputDTO> {
    const session = await this.chargerSessionRepository.findById(sessionId);
    if (!session || session.userId !== userId) {
      throw new NotFoundException('Sessão não encontrada.');
    }

    if (session.statusId !== ChargerSessionStatusEnum.CHARGING) {
      throw new ConflictException('A sessão não está ativa.');
    }

    const telemetryData =
      await this.telemetryPort.getChargingTelemetry(sessionId);

    if (!telemetryData) {
      throw new ConflictException(
        'Falha ao conectar à telemetria do carregador.',
      );
    }

    const stopped = await this.telemetryPort.stopCharging(session.chargerId);
    if (stopped === null || stopped === false) {
      throw new ConflictException(
        'Falha ao interromper o carregamento via telemetria.',
      );
    }

    // Calcula preço baseado no preço do carregador (definido no banco de dados)
    const charger = await this.chargerRepository.findById(session.chargerId);

    const pricePerKwhCents = charger ? charger.pricePerKwhCents : 85;

    const amountToCharge = Math.round(
      telemetryData.energyDeliveredKwh * pricePerKwhCents,
    );

    const completedSession = await this.chargerSessionRepository.complete(
      sessionId,
      {
        consumedAmountCents: amountToCharge,
        energyDeliveredKwh: telemetryData.energyDeliveredKwh,
        finishedAt: new Date(),
      },
    );

    // Create payment transaction
    if (amountToCharge > 0) {
      await this.paymentTransactionRepository.create({
        userId,
        chargerSessionId: sessionId,
        amountCents: amountToCharge,
        statusId: TransactionStatusEnum.PENDING,
        idempotencyKey: `stop_session_${sessionId}`,
        paymentMethodId: input.paymentMethodId,
        finalAmountCents: amountToCharge,
      });
    }

    return {
      id: completedSession.id,
      userId: completedSession.userId,
      vehicleId: completedSession.vehicleId || null,
      chargerId: completedSession.chargerId,
      statusId: completedSession.statusId,
      consumedAmountCents: completedSession.consumedAmountCents,
      energyDeliveredKwh: completedSession.energyDeliveredKwh,
      startedAt: completedSession.startedAt || new Date(),
      finishedAt: completedSession.finishedAt || new Date(),
    };
  }
}
