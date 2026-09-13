import { Injectable } from '@nestjs/common';
import { PaymentTransactionRepository } from '../../../database/repositories/payment-transaction/payment-transaction.repository';
import { PaymentTransactionOutputDTO } from '../dto/io/transaction-io.dto';

@Injectable()
export class FindManyTransactionsService {
  constructor(
    private readonly paymentTransactionRepository: PaymentTransactionRepository,
  ) {}

  async execute(
    userId: string,
    skip: number = 0,
    take: number = 20,
  ): Promise<PaymentTransactionOutputDTO[]> {
    const transactions = await this.paymentTransactionRepository.findByUserId(
      userId,
      skip,
      take,
    );

    return transactions.map((tx) => ({
      id: tx.id,
      chargerSessionId: tx.chargerSessionId,
      amountCents: tx.amountCents,
      statusId: tx.statusId,
      paymentMethodId: tx.paymentMethodId,
      createdAt: tx.createdAt,
      updatedAt: tx.updatedAt,
    }));
  }
}
