import { TransactionStatusEnum } from '../../../../common/enums';

export type PaymentTransactionOutputDTO = {
  id: string;
  chargerSessionId?: string | null;
  amountCents: number;
  statusId: TransactionStatusEnum;
  paymentMethodId?: number | null;
  createdAt: Date;
  updatedAt: Date;
};
