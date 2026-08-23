export type UpdateVoucherDTO = {
  code?: string;
  typeId?: number;
  value?: number;
  maxUsages?: number;
  maxAmountCents?: number;
  validFrom?: Date;
  validUntil?: Date;
  isActive?: boolean;
};
