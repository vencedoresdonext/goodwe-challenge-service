import { ChargerSessionStatusEnum } from 'src/common/enums';

export type CreateChargerSessionDTO = {
  userId: string;
  vehicleId?: string | null;
  chargerId: string;
  statusId: ChargerSessionStatusEnum;
  preAuthorizedAmountCents?: number;
};
