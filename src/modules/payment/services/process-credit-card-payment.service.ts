import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  ChargerSessionRepository,
  CustomerCardRepository,
  PaymentTransactionRepository,
  VoucherRepository,
  ChargerRepository,
} from 'src/database/repositories';
import { PaymentGatewayPort } from 'src/integrations/payment-gateway/payment-gateway.port';
import { ValidateVoucherService } from './validate-voucher.service';
import { ProcessCreditCardInputDTO } from '../dto/io/process-credit-card-io.dto';
import { ProcessCreditCardOutputDTO } from '../dto/io/process-credit-card-io.dto';
import {
  ChargerSessionStatusEnum,
  PaymentMethodEnum,
  TransactionStatusEnum,
} from 'src/common/enums';

@Injectable()
export class ProcessCreditCardPaymentService {
  private readonly logger = new Logger(ProcessCreditCardPaymentService.name);

  private readonly statusMap: Record<
    string,
    { tx: TransactionStatusEnum; session: ChargerSessionStatusEnum }
  > = {
    approved: {
      tx: TransactionStatusEnum.AUTHORIZED,
      session: ChargerSessionStatusEnum.AUTHORIZED,
    },
    pending: {
      tx: TransactionStatusEnum.PENDING,
      session: ChargerSessionStatusEnum.AWAITING_PAYMENT,
    },
    rejected: {
      tx: TransactionStatusEnum.FAILED,
      session: ChargerSessionStatusEnum.FAILED,
    },
  };

  constructor(
    private readonly transactionRepository: PaymentTransactionRepository,
    private readonly sessionRepository: ChargerSessionRepository,
    private readonly cardRepository: CustomerCardRepository,
    private readonly voucherRepository: VoucherRepository,
    private readonly chargerRepository: ChargerRepository,
    private readonly paymentGateway: PaymentGatewayPort,
    private readonly validateVoucherService: ValidateVoucherService,
  ) {}

  async execute(
    input: ProcessCreditCardInputDTO,
  ): Promise<ProcessCreditCardOutputDTO> {
    const existingTx = await this.transactionRepository.findByIdempotencyKey(
      input.idempotencyKey,
    );

    if (existingTx) {
      this.logger.log(`Idempotent request detected: ${input.idempotencyKey}`);
      return {
        transactionId: existingTx.id,
        sessionId: existingTx.chargerSessionId || '',
        statusId: existingTx.statusId,
        gatewayTransactionId: existingTx.gatewayTransactionId || '',
        amountCents: existingTx.amountCents,
        discountCents: existingTx.discountCents,
        finalAmountCents: existingTx.finalAmountCents,
      };
    }

    const card = await this.cardRepository.findById(input.customerCardId);

    if (!card || card.userId !== input.userId) {
      throw new NotFoundException('Cartão não encontrado');
    }

    const activeSession = await this.sessionRepository.findActiveByChargerId(
      input.chargerId,
    );

    if (activeSession) {
      throw new BadRequestException(
        'Este carregador já possui uma sessão ativa',
      );
    }

    const charger = await this.chargerRepository.findById(input.chargerId);
    if (!charger || !charger.receiverUserId) {
      throw new BadRequestException(
        'Carregador não está atrelado a uma conta recebedora',
      );
    }

    let discountCents = 0;
    let voucherId: string | undefined;

    if (input.voucherCode) {
      const voucherResult = await this.validateVoucherService.execute({
        code: input.voucherCode,
        amountCents: input.amountCents,
      });
      discountCents = voucherResult.discountCents;
      voucherId = voucherResult.voucherId;
    }

    const finalAmountCents = Math.max(input.amountCents - discountCents, 0);

    const session = await this.sessionRepository.create({
      userId: input.userId,
      chargerId: input.chargerId,
      statusId: ChargerSessionStatusEnum.AWAITING_PAYMENT,
      preAuthorizedAmountCents: finalAmountCents,
    });

    const chargeResult = await this.paymentGateway.chargeCreditCard({
      gatewayToken: card.gatewayToken,
      amountCents: finalAmountCents,
      description: input.description,
      externalReference: session.id,
      installments: input.installments || 1,
      payerEmail: input.payerEmail,
      receiverAccountId: charger.receiverUserId,
      capture: false,
    });

    const mappedStatus = this.statusMap[chargeResult.statusId] || {
      tx: TransactionStatusEnum.FAILED,
      session: ChargerSessionStatusEnum.FAILED,
    };

    const txStatus = mappedStatus.tx;
    const sessionStatus = mappedStatus.session;

    const transaction = await this.transactionRepository.create({
      userId: input.userId,
      chargerSessionId: session.id,
      voucherId,
      idempotencyKey: input.idempotencyKey,
      paymentMethodId: PaymentMethodEnum.CREDIT_CARD,
      statusId: txStatus,
      amountCents: input.amountCents,
      discountCents,
      finalAmountCents,
      gatewayTransactionId: chargeResult.gatewayTransactionId,
      customerCardId: card.id,
      gatewayMetadata: JSON.stringify({
        statusDetail: chargeResult.statusDetail,
      }),
    });

    await this.sessionRepository.updateStatus(session.id, sessionStatus);

    if (voucherId && txStatus !== TransactionStatusEnum.FAILED) {
      await this.voucherRepository.incrementUsage(voucherId);
    }

    this.logger.log(
      `Credit card payment: tx=${transaction.id}, status=${txStatus}`,
    );

    return {
      transactionId: transaction.id,
      sessionId: session.id,
      statusId: txStatus,
      gatewayTransactionId: chargeResult.gatewayTransactionId,
      amountCents: input.amountCents,
      discountCents,
      finalAmountCents,
    };
  }
}
