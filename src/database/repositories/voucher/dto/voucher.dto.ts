export type VoucherDTO = {
  id: string;
  code: string;
  typeId: number;
  value: number;
  maxUsages: number;
  currentUsages: number;
  maxAmountCents: number | null;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};
