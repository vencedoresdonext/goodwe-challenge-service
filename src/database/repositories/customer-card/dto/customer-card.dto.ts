export type CustomerCardDTO = {
  id: string;
  userId: string;
  gatewayToken: string;
  lastFourDigits: string;
  brand: string;
  holderName: string;
  expiresAt: Date;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
};
