export type ProcessCreditCardOutputDTO = {
  transactionId: string;
  sessionId: string;
  statusId: number;
  gatewayTransactionId: string;
  amountCents: number;
  discountCents: number;
  finalAmountCents: number;
};
export type ProcessCreditCardInputDTO = {
  userId: string;
  customerCardId: string;
  amountCents: number;
  chargerId: string;
  description: string;
  payerEmail: string;
  idempotencyKey: string;
  installments?: number;
  voucherCode?: string;
};
