import { ChargerSessionDTO } from './dto/charger-session.dto';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { ChargerSessionRepository } from './charger-session.repository';
import { CreateChargerSessionDTO } from './dto/create-charger-session.dto';
import { CompleteChargerSessionDTO } from './dto/complete-charger-session.dto';
import { ChargerSessionStatusEnum } from '../../../common/enums';

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
        chargerId: true,
        statusId: true,
        preAuthorizedAmountCents: true,
        consumedAmountCents: true,
        energyDeliveredKwh: true,
        startedAt: true,
        finishedAt: true,
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
        chargerId: true,
        statusId: true,
        preAuthorizedAmountCents: true,
        consumedAmountCents: true,
        energyDeliveredKwh: true,
        startedAt: true,
        finishedAt: true,
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
        chargerId: true,
        statusId: true,
        preAuthorizedAmountCents: true,
        consumedAmountCents: true,
        energyDeliveredKwh: true,
        startedAt: true,
        finishedAt: true,
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
        chargerId: true,
        statusId: true,
        preAuthorizedAmountCents: true,
        consumedAmountCents: true,
        energyDeliveredKwh: true,
        startedAt: true,
        finishedAt: true,
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
        chargerId: true,
        statusId: true,
        preAuthorizedAmountCents: true,
        consumedAmountCents: true,
        energyDeliveredKwh: true,
        startedAt: true,
        finishedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
