export type CompleteSessionInputDTO = {
  sessionId: string;
  userId: string;
  energyDeliveredKwh: number;
  consumedAmountCents: number;
  chargerId: string;
};
