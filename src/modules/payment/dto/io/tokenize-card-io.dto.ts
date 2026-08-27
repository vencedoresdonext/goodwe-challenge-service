export type TokenizeCardInputDTO = {
  userId: string;
  cardNumber: string;
  holderName: string;
  expirationMonth: number;
  expirationYear: number;
  securityCode: string;
  identificationType: string;
  identificationNumber: string;
};
export type TokenizeCardOutputDTO = {
  id: string;
  lastFourDigits: string;
  brand: string;
  holderName: string;
  expiresAt: Date;
  isDefault: boolean;
};
