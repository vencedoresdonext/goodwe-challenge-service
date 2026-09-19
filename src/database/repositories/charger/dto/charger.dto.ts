export type ChargerDTO = {
  id: string;
  receiverUserId: string;
  receiverCardId: string | null;
  pricePerKwhCents: number;
  createdAt: Date;
  updatedAt: Date;
};
