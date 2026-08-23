import { ChargerSessionStatusEnum } from 'src/common/enums';

export type CreateChargerSessionDTO = {
  userId: string;
  chargerId: string;
  statusId: ChargerSessionStatusEnum;
  preAuthorizedAmountCents?: number;
};
