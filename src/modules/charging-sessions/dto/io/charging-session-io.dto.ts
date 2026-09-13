import { ChargerSessionStatusEnum } from '../../../../common/enums';

export type ChargingSessionOutputDTO = {
  id: string;
  userId: string;
  vehicleId: string | null;
  chargerId: string;
  statusId: ChargerSessionStatusEnum;
  consumedAmountCents: number;
  energyDeliveredKwh: number;
  startedAt: Date | null;
  finishedAt: Date | null;
  telemetry?: {
    powerKw: number;
    batteryPercentage: number;
    estimatedTimeLeftMinutes: number | null;
  };
};
