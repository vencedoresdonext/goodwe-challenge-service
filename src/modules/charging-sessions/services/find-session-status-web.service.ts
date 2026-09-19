import { Injectable, NotFoundException } from '@nestjs/common';
import { ChargerSessionRepository } from '../../../database/repositories/charger-session/charger-session.repository';
import { ChargingSessionOutputDTO } from '../dto/io/charging-session-io.dto';

@Injectable()
export class FindSessionStatusWebService {
  constructor(
    private readonly chargerSessionRepository: ChargerSessionRepository,
  ) {}

  async execute(
    userId: string,
    sessionId: string,
  ): Promise<ChargingSessionOutputDTO> {
    const session = await this.chargerSessionRepository.findByIdFilteredByOwner(
      sessionId,
      userId,
    );

    if (!session) {
      throw new NotFoundException('Sessão não encontrada.');
    }

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
