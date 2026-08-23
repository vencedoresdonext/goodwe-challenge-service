export type CreateCustomerCardDTO = {
  userId: string;
  gatewayToken: string;
  lastFourDigits: string;
  brand: string;
  holderName: string;
  expiresAt: Date;
  isDefault?: boolean;
};
