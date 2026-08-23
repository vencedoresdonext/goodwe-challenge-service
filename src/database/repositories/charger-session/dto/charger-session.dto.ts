import { ChargerSessionStatusEnum } from 'src/common/enums';

export type ChargerSessionDTO = {
  id: string;
  userId: string;
  chargerId: string;
  statusId: ChargerSessionStatusEnum;
  preAuthorizedAmountCents: number;
  consumedAmountCents: number;
  energyDeliveredKwh: number;
  startedAt: Date | null;
  finishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};
