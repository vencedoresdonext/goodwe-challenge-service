import { PaymentTransactionDTO } from './dto/payment-transaction.dto';
import { CreatePaymentTransactionDTO } from './dto/create-payment-transaction.dto';

export abstract class PaymentTransactionRepository {
  abstract create(
    data: CreatePaymentTransactionDTO,
  ): Promise<PaymentTransactionDTO>;

  abstract findById(id: string): Promise<PaymentTransactionDTO | null>;

  abstract findByIdempotencyKey(
    key: string,
  ): Promise<PaymentTransactionDTO | null>;

  abstract findByGatewayTransactionId(
    gatewayTxId: string,
  ): Promise<PaymentTransactionDTO | null>;

  abstract findByPixTxId(txId: string): Promise<PaymentTransactionDTO | null>;

  abstract updateStatus(
    id: string,
    statusId: number,
    metadata?: { failureReason?: string; gatewayMetadata?: string },
  ): Promise<PaymentTransactionDTO>;

  abstract findByUserId(
    userId: string,
    skip: number,
    take: number,
  ): Promise<PaymentTransactionDTO[]>;

  abstract findByChargerOwner(
    ownerId: string,
    skip: number,
    take: number,
  ): Promise<PaymentTransactionDTO[]>;
}
