export type CreateVoucherDTO = {
  code: string;
  typeId: number;
  value: number;
  maxUsages: number;
  maxAmountCents?: number;
  validFrom: Date;
  validUntil: Date;
};
