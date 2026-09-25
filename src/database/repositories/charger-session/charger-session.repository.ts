import { ChargerSessionDTO } from './dto/charger-session.dto';
import { CreateChargerSessionDTO } from './dto/create-charger-session.dto';
import { CompleteChargerSessionDTO } from './dto/complete-charger-session.dto';
import { ChargerSessionStatusEnum } from '../../../common/enums';
import { ChargerSessionEnergyDTO } from './dto/charger-session-energy.dto';

export abstract class ChargerSessionRepository {
  abstract create(data: CreateChargerSessionDTO): Promise<ChargerSessionDTO>;
  abstract findById(id: string): Promise<ChargerSessionDTO | null>;
  abstract findActiveByChargerId(
    chargerId: string,
  ): Promise<ChargerSessionDTO | null>;
  abstract findActiveByUserId(
    userId: string,
  ): Promise<ChargerSessionDTO | null>;
  abstract findByUserId(
    userId: string,
    skip: number,
    take: number,
  ): Promise<ChargerSessionDTO[]>;
  abstract findByChargerOwner(
    ownerId: string,
    skip: number,
    take: number,
  ): Promise<ChargerSessionDTO[]>;
  abstract findByIdFilteredByOwner(
    id: string,
    ownerId: string,
  ): Promise<ChargerSessionDTO | null>;
  abstract updateStatus(
    id: string,
    statusId: ChargerSessionStatusEnum,
  ): Promise<ChargerSessionDTO>;
  abstract updateConsumption(
    id: string,
    energyKwh: number,
    amountCents: number,
  ): Promise<ChargerSessionDTO>;
  abstract complete(
    id: string,
    data: CompleteChargerSessionDTO,
  ): Promise<ChargerSessionDTO>;
  abstract findManyByStatus(
    statusId: ChargerSessionStatusEnum,
  ): Promise<ChargerSessionDTO[]>;
  abstract updateIdleData(
    id: string,
    data: { idleStartedAt?: Date; lastBatteryPercentage?: number },
  ): Promise<ChargerSessionDTO>;
  abstract findEnergyByChargerOwner(
    ownerId: string,
    from: Date,
    to: Date,
    stationId?: string,
  ): Promise<ChargerSessionEnergyDTO[]>;
}
