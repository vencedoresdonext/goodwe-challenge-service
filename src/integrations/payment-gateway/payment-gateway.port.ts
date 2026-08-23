export type TokenizeCardInput = {
  cardNumber: string;
  holderName: string;
  expirationMonth: number;
  expirationYear: number;
  securityCode: string;
  identificationType: string;
  identificationNumber: string;
};

export type TokenizeCardOutput = {
  gatewayToken: string;
  lastFourDigits: string;
  brand: string;
  expiresAt: Date;
};

export type CreatePixInput = {
  amountCents: number;
  description: string;
  externalReference: string;
  payerEmail: string;
  receiverAccountId?: string;
  expirationMinutes?: number;
};

export type CreatePixOutput = {
  gatewayTransactionId: string;
  pixPayload: string;
  pixTxId: string;
  pixExpiresAt: Date;
  qrCodeBase64?: string;
};

export type ChargeCreditCardInput = {
  gatewayToken: string;
  amountCents: number;
  description: string;
  externalReference: string;
  installments?: number;
  payerEmail: string;
  receiverAccountId?: string;
  capture?: boolean;
};

export type ChargeCreditCardOutput = {
  gatewayTransactionId: string;
  statusId: 'approved' | 'pending' | 'rejected';
  statusDetail: string;
};

export type CaptureOutput = {
  gatewayTransactionId: string;
  statusId: number;
  capturedAmountCents: number;
};

export type RefundOutput = {
  refundId: string;
  statusId: number;
  refundedAmountCents: number;
};

export abstract class PaymentGatewayPort {
  abstract tokenizeCard(data: TokenizeCardInput): Promise<TokenizeCardOutput>;

  abstract createPixCharge(data: CreatePixInput): Promise<CreatePixOutput>;

  abstract chargeCreditCard(
    data: ChargeCreditCardInput,
  ): Promise<ChargeCreditCardOutput>;

  abstract capturePreAuthorization(
    gatewayTxId: string,
    amountCents: number,
  ): Promise<CaptureOutput>;

  abstract refund(
    gatewayTxId: string,
    amountCents: number,
  ): Promise<RefundOutput>;

  abstract validateWebhookSignature(
    payload: string,
    signature: string,
  ): boolean;
}
