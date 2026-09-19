import { Injectable } from '@nestjs/common';
import { ChargerSessionRepository } from '../../../database/repositories/charger-session/charger-session.repository';
import { ChargingSessionOutputDTO } from '../dto/io/charging-session-io.dto';

@Injectable()
export class FindManySessionsWebService {
  constructor(
    private readonly chargerSessionRepository: ChargerSessionRepository,
  ) {}

  async execute(
    userId: string,
    skip: number = 0,
    take: number = 20,
  ): Promise<ChargingSessionOutputDTO[]> {
    const sessions = await this.chargerSessionRepository.findByChargerOwner(
      userId,
      skip,
      take,
    );

    return sessions.map((session) => ({
      id: session.id,
      userId: session.userId,
      vehicleId: session.vehicleId || null,
      chargerId: session.chargerId,
      statusId: session.statusId,
      consumedAmountCents: session.consumedAmountCents,
      energyDeliveredKwh: session.energyDeliveredKwh,
      startedAt: session.startedAt || new Date(),
      finishedAt: session.finishedAt || null,
    }));
  }
}
