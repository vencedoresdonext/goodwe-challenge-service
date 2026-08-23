export type CreatePaymentTransactionDTO = {
  userId: string;
  chargerSessionId?: string;
  voucherId?: string;
  idempotencyKey: string;
  paymentMethodId: number;
  statusId: number;
  amountCents: number;
  discountCents?: number;
  finalAmountCents: number;
  gatewayTransactionId?: string;
  pixPayload?: string;
  pixTxId?: string;
  pixExpiresAt?: Date;
  customerCardId?: string;
  gatewayMetadata?: string;
};
