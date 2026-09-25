import { ChargerSessionDTO } from './dto/charger-session.dto';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { ChargerSessionRepository } from './charger-session.repository';
import { CreateChargerSessionDTO } from './dto/create-charger-session.dto';
import { CompleteChargerSessionDTO } from './dto/complete-charger-session.dto';
import { ChargerSessionStatusEnum } from '../../../common/enums';
import { ChargerSessionEnergyDTO } from './dto/charger-session-energy.dto';

@Injectable()
export class PrismaChargerSessionRepository implements ChargerSessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateChargerSessionDTO): Promise<ChargerSessionDTO> {
    return this.prisma.chargerSession.create({ data });
  }

  findById(id: string): Promise<ChargerSessionDTO | null> {
    return this.prisma.chargerSession.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        vehicleId: true,
        chargerId: true,
        statusId: true,
        preAuthorizedAmountCents: true,
        consumedAmountCents: true,
        energyDeliveredKwh: true,
        startedAt: true,
        finishedAt: true,
        idleStartedAt: true,
        lastBatteryPercentage: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  findActiveByChargerId(chargerId: string): Promise<ChargerSessionDTO | null> {
    return this.prisma.chargerSession.findFirst({
      where: {
        chargerId,
        statusId: {
          in: [
            ChargerSessionStatusEnum.AWAITING_PAYMENT,
            ChargerSessionStatusEnum.AUTHORIZED,
            ChargerSessionStatusEnum.CHARGING,
          ],
        },
      },
      select: {
        id: true,
        userId: true,
        vehicleId: true,
        chargerId: true,
        statusId: true,
        preAuthorizedAmountCents: true,
        consumedAmountCents: true,
        energyDeliveredKwh: true,
        startedAt: true,
        finishedAt: true,
        idleStartedAt: true,
        lastBatteryPercentage: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  findActiveByUserId(userId: string): Promise<ChargerSessionDTO | null> {
    return this.prisma.chargerSession.findFirst({
      where: {
        userId,
        statusId: {
          in: [
            ChargerSessionStatusEnum.AWAITING_PAYMENT,
            ChargerSessionStatusEnum.AUTHORIZED,
            ChargerSessionStatusEnum.CHARGING,
          ],
        },
      },
      select: {
        id: true,
        userId: true,
        vehicleId: true,
        chargerId: true,
        statusId: true,
        preAuthorizedAmountCents: true,
        consumedAmountCents: true,
        energyDeliveredKwh: true,
        startedAt: true,
        finishedAt: true,
        idleStartedAt: true,
        lastBatteryPercentage: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  findByUserId(
    userId: string,
    skip: number,
    take: number,
  ): Promise<ChargerSessionDTO[]> {
    return this.prisma.chargerSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      select: {
        id: true,
        userId: true,
        vehicleId: true,
        chargerId: true,
        statusId: true,
        preAuthorizedAmountCents: true,
        consumedAmountCents: true,
        energyDeliveredKwh: true,
        startedAt: true,
        finishedAt: true,
        idleStartedAt: true,
        lastBatteryPercentage: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  findByChargerOwner(
    ownerId: string,
    skip: number,
    take: number,
  ): Promise<ChargerSessionDTO[]> {
    return this.prisma.chargerSession.findMany({
      where: {
        charger: {
          receiverUserId: ownerId,
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      select: {
        id: true,
        userId: true,
        vehicleId: true,
        chargerId: true,
        statusId: true,
        preAuthorizedAmountCents: true,
        consumedAmountCents: true,
        energyDeliveredKwh: true,
        startedAt: true,
        finishedAt: true,
        idleStartedAt: true,
        lastBatteryPercentage: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  findByIdFilteredByOwner(
    id: string,
    ownerId: string,
  ): Promise<ChargerSessionDTO | null> {
    return this.prisma.chargerSession.findFirst({
      where: {
        id,
        charger: {
          receiverUserId: ownerId,
        },
      },
      select: {
        id: true,
        userId: true,
        vehicleId: true,
        chargerId: true,
        statusId: true,
        preAuthorizedAmountCents: true,
        consumedAmountCents: true,
        energyDeliveredKwh: true,
        startedAt: true,
        finishedAt: true,
        idleStartedAt: true,
        lastBatteryPercentage: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  updateStatus(
    id: string,
    statusId: ChargerSessionStatusEnum,
  ): Promise<ChargerSessionDTO> {
    return this.prisma.chargerSession.update({
      where: { id },
      data: {
        statusId,
        ...(statusId === ChargerSessionStatusEnum.CHARGING && {
          startedAt: new Date(),
        }),
      },
      select: {
        id: true,
        userId: true,
        vehicleId: true,
        chargerId: true,
        statusId: true,
        preAuthorizedAmountCents: true,
        consumedAmountCents: true,
        energyDeliveredKwh: true,
        startedAt: true,
        finishedAt: true,
        idleStartedAt: true,
        lastBatteryPercentage: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  updateConsumption(
    id: string,
    energyKwh: number,
    amountCents: number,
  ): Promise<ChargerSessionDTO> {
    return this.prisma.chargerSession.update({
      where: { id },
      data: {
        energyDeliveredKwh: energyKwh,
        consumedAmountCents: amountCents,
      },
      select: {
        id: true,
        userId: true,
        vehicleId: true,
        chargerId: true,
        statusId: true,
        preAuthorizedAmountCents: true,
        consumedAmountCents: true,
        energyDeliveredKwh: true,
        startedAt: true,
        finishedAt: true,
        idleStartedAt: true,
        lastBatteryPercentage: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  complete(
    id: string,
    data: CompleteChargerSessionDTO,
  ): Promise<ChargerSessionDTO> {
    return this.prisma.chargerSession.update({
      where: { id },
      data: {
        statusId: ChargerSessionStatusEnum.COMPLETED,
        consumedAmountCents: data.consumedAmountCents,
        energyDeliveredKwh: data.energyDeliveredKwh,
        finishedAt: data.finishedAt,
      },
      select: {
        id: true,
        userId: true,
        vehicleId: true,
        chargerId: true,
        statusId: true,
        preAuthorizedAmountCents: true,
        consumedAmountCents: true,
        energyDeliveredKwh: true,
        startedAt: true,
        finishedAt: true,
        idleStartedAt: true,
        lastBatteryPercentage: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  findManyByStatus(
    statusId: ChargerSessionStatusEnum,
  ): Promise<ChargerSessionDTO[]> {
    return this.prisma.chargerSession.findMany({
      where: { statusId },
      select: {
        id: true,
        userId: true,
        vehicleId: true,
        chargerId: true,
        statusId: true,
        preAuthorizedAmountCents: true,
        consumedAmountCents: true,
        energyDeliveredKwh: true,
        startedAt: true,
        finishedAt: true,
        idleStartedAt: true,
        lastBatteryPercentage: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  updateIdleData(
    id: string,
    data: { idleStartedAt?: Date; lastBatteryPercentage?: number },
  ): Promise<ChargerSessionDTO> {
    return this.prisma.chargerSession.update({
      where: { id },
      data,
      select: {
        id: true,
        userId: true,
        vehicleId: true,
        chargerId: true,
        statusId: true,
        preAuthorizedAmountCents: true,
        consumedAmountCents: true,
        energyDeliveredKwh: true,
        startedAt: true,
        finishedAt: true,
        idleStartedAt: true,
        lastBatteryPercentage: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findEnergyByChargerOwner(
    ownerId: string,
    from: Date,
    to: Date,
    stationId?: string,
  ): Promise<ChargerSessionEnergyDTO[]> {
    const sessions = await this.prisma.chargerSession.findMany({
      where: {
        startedAt: { not: null, lt: to },
        OR: [{ finishedAt: null }, { finishedAt: { gt: from } }],
        charger: {
          receiverUserId: ownerId,
          ...(stationId && { connector: { stationId } }),
        },
      },
      orderBy: { startedAt: 'asc' },
      select: {
        id: true,
        chargerId: true,
        statusId: true,
        energyDeliveredKwh: true,
        consumedAmountCents: true,
        startedAt: true,
        finishedAt: true,
        charger: {
          select: {
            connector: { select: { stationId: true, maxPowerKw: true } },
          },
        },
      },
    });

    return sessions.map((s) => ({
      id: s.id,
      chargerId: s.chargerId,
      stationId: s.charger.connector?.stationId ?? null,
      maxPowerKw: s.charger.connector?.maxPowerKw ?? null,
      statusId: s.statusId,
      energyDeliveredKwh: s.energyDeliveredKwh,
      consumedAmountCents: s.consumedAmountCents,
      startedAt: s.startedAt as Date,
      finishedAt: s.finishedAt,
    }));
  }
}
