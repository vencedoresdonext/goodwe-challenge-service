import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import {
  ChargerSessionRepository,
  PaymentTransactionRepository,
  ChargerRepository,
} from '../../../database/repositories';
import { PaymentGatewayPort } from '../../../integrations/payment-gateway/payment-gateway.port';
import { CreatePixChargeInputDTO } from '../dto/io/create-pix-charge-io.dto';
import { CreatePixChargeOutputDTO } from '../dto/io/create-pix-charge-io.dto';
import {
  ChargerSessionStatusEnum,
  PaymentMethodEnum,
  TransactionStatusEnum,
} from '../../../common/enums';

@Injectable()
export class CreatePixChargeService {
  private readonly logger = new Logger(CreatePixChargeService.name);

  constructor(
    private readonly transactionRepository: PaymentTransactionRepository,
    private readonly sessionRepository: ChargerSessionRepository,
    private readonly chargerRepository: ChargerRepository,
    private readonly paymentGateway: PaymentGatewayPort,
  ) {}

  async execute(
    input: CreatePixChargeInputDTO,
  ): Promise<CreatePixChargeOutputDTO> {
    const existingTx = await this.transactionRepository.findByIdempotencyKey(
      input.idempotencyKey,
    );

    if (existingTx) {
      this.logger.log(`Idempotent request detected: ${input.idempotencyKey}`);
      return {
        transactionId: existingTx.id,
        sessionId: existingTx.chargerSessionId || '',
        pixPayload: existingTx.pixPayload || '',
        pixTxId: existingTx.pixTxId || '',
        pixExpiresAt: existingTx.pixExpiresAt || new Date(),
        amountCents: existingTx.amountCents,

        finalAmountCents: existingTx.finalAmountCents,
      };
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

    const finalAmountCents = input.amountCents;

    const session = await this.sessionRepository.create({
      userId: input.userId,
      chargerId: input.chargerId,
      statusId: ChargerSessionStatusEnum.AWAITING_PAYMENT,
      preAuthorizedAmountCents: finalAmountCents,
    });

    const pixResult = await this.paymentGateway.createPixCharge({
      amountCents: finalAmountCents,
      description: input.description,
      externalReference: session.id,
      payerEmail: input.payerEmail,
      receiverAccountId: charger.receiverUserId,
    });

    const transaction = await this.transactionRepository.create({
      userId: input.userId,
      chargerSessionId: session.id,
      idempotencyKey: input.idempotencyKey,
      paymentMethodId: PaymentMethodEnum.PIX,
      statusId: TransactionStatusEnum.PENDING,
      amountCents: input.amountCents,
      finalAmountCents,
      gatewayTransactionId: pixResult.gatewayTransactionId,
      pixPayload: pixResult.pixPayload,
      pixTxId: pixResult.pixTxId,
      pixExpiresAt: pixResult.pixExpiresAt,
    });

    this.logger.log(
      `Pix charge created: tx=${transaction.id}, session=${session.id}`,
    );

    return {
      transactionId: transaction.id,
      sessionId: session.id,
      pixPayload: pixResult.pixPayload,
      pixTxId: pixResult.pixTxId,
      pixExpiresAt: pixResult.pixExpiresAt,
      amountCents: input.amountCents,
      finalAmountCents,
      qrCodeBase64: pixResult.qrCodeBase64,
    };
  }
}
