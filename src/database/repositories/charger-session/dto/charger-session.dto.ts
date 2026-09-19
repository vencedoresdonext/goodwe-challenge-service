import { ChargerSessionStatusEnum } from 'src/common/enums';

export type ChargerSessionDTO = {
  id: string;
  userId: string;
  vehicleId?: string | null;
  chargerId: string;
  statusId: ChargerSessionStatusEnum;
  preAuthorizedAmountCents: number;
  consumedAmountCents: number;
  energyDeliveredKwh: number;
  startedAt: Date | null;
  finishedAt: Date | null;
  idleStartedAt: Date | null;
  lastBatteryPercentage: number | null;
  createdAt: Date;
  updatedAt: Date;
};
