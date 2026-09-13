import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import {
  ChargerSessionRepository,
  PaymentTransactionRepository,
} from '../../../database/repositories';
import { PaymentGatewayPort } from '../../../integrations/payment-gateway/payment-gateway.port';
import { WebhookInputDTO } from '../dto/io/webhook-io.dto';
import {
  ChargerSessionStatusEnum,
  TransactionStatusEnum,
} from '../../../common/enums';

@Injectable()
export class HandlePaymentWebhookService {
  private readonly logger = new Logger(HandlePaymentWebhookService.name);

  private readonly statusMap: Record<
    string,
    { tx: TransactionStatusEnum; session: ChargerSessionStatusEnum }
  > = {
    approved: {
      tx: TransactionStatusEnum.CAPTURED,
      session: ChargerSessionStatusEnum.AUTHORIZED,
    },
    rejected: {
      tx: TransactionStatusEnum.FAILED,
      session: ChargerSessionStatusEnum.FAILED,
    },
    cancelled: {
      tx: TransactionStatusEnum.FAILED,
      session: ChargerSessionStatusEnum.FAILED,
    },
    refunded: {
      tx: TransactionStatusEnum.REFUNDED,
      session: ChargerSessionStatusEnum.CANCELLED,
    },
  };

  constructor(
    private readonly transactionRepository: PaymentTransactionRepository,
    private readonly sessionRepository: ChargerSessionRepository,
    private readonly paymentGateway: PaymentGatewayPort,
  ) {}

  async execute(input: WebhookInputDTO): Promise<void> {
    const isValid = this.paymentGateway.validateWebhookSignature(
      JSON.stringify(input.payload),
      input.signature,
    );

    if (!isValid) {
      this.logger.warn('Invalid webhook signature received');
      throw new UnauthorizedException('Assinatura do webhook inválida');
    }

    const webhookData = input.payload;
    const gatewayTxId = String(webhookData.data?.id || webhookData.id || '');
    const action = webhookData.action || webhookData.type || '';

    this.logger.log(
      `Webhook received: action=${action}, gatewayTxId=${gatewayTxId}`,
    );

    if (!gatewayTxId) {
      this.logger.warn('Webhook sem ID de transação — ignorando');
      return;
    }

    const transaction =
      await this.transactionRepository.findByGatewayTransactionId(gatewayTxId);

    if (!transaction) {
      this.logger.warn(`Transaction not found for gateway ID: ${gatewayTxId}`);
      return;
    }

    const finalStatuses = [
      TransactionStatusEnum.CAPTURED,
      TransactionStatusEnum.FAILED,
      TransactionStatusEnum.REFUNDED,
    ];

    if (finalStatuses.includes(transaction.statusId)) {
      this.logger.log(
        `Transaction ${transaction.id} already in final state: ${transaction.statusId}`,
      );
      return;
    }

    const mpStatus = webhookData.data?.statusId || webhookData.statusId || '';

    const mappedStatus = this.statusMap[mpStatus];

    if (!mappedStatus) {
      this.logger.log(`Unhandled webhook statusId: ${mpStatus}`);
      return;
    }

    const newTxStatus = mappedStatus.tx;
    const newSessionStatus = mappedStatus.session;

    await this.transactionRepository.updateStatus(transaction.id, newTxStatus, {
      gatewayMetadata: JSON.stringify(webhookData),
    });

    if (newSessionStatus && transaction.chargerSessionId) {
      await this.sessionRepository.updateStatus(
        transaction.chargerSessionId,
        newSessionStatus,
      );
    }

    this.logger.log(
      `Webhook processed: tx=${transaction.id}, newStatus=${newTxStatus}`,
    );
  }
}
