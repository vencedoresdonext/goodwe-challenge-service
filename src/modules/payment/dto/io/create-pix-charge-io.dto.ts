export type CreatePixChargeOutputDTO = {
  transactionId: string;
  sessionId: string;
  pixPayload: string;
  pixTxId: string;
  pixExpiresAt: Date;
  amountCents: number;

  finalAmountCents: number;
  qrCodeBase64?: string;
};
export type CreatePixChargeInputDTO = {
  userId: string;
  amountCents: number;
  chargerId: string;
  description: string;
  payerEmail: string;
  idempotencyKey: string;
};
