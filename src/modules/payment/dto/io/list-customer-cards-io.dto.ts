export type ListCustomerCardsOutputDTO = {
  id: string;
  lastFourDigits: string;
  brand: string;
  holderName: string;
  expiresAt: Date;
  isDefault: boolean;
};
