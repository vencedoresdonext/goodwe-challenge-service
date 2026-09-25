export type ChargerSessionEnergyDTO = {
  id: string;
  chargerId: string;
  stationId: string | null;
  maxPowerKw: number | null;
  statusId: number;
  energyDeliveredKwh: number;
  consumedAmountCents: number;
  startedAt: Date;
  finishedAt: Date | null;
};
