export type ValidateVoucherInputDTO = {
  code: string;
  amountCents: number;
};
export type ValidateVoucherOutputDTO = {
  voucherId: string;
  code: string;
  typeId: number;
  discountCents: number;
  finalAmountCents: number;
};
