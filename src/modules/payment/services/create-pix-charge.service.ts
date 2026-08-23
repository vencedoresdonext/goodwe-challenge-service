import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import {
  ChargerSessionRepository,
  PaymentTransactionRepository,
  VoucherRepository,
  ChargerRepository,
} from 'src/database/repositories';
import { PaymentGatewayPort } from 'src/integrations/payment-gateway/payment-gateway.port';
import { CreatePixChargeInputDTO } from '../dto/io/create-pix-charge-io.dto';
import { CreatePixChargeOutputDTO } from '../dto/io/create-pix-charge-io.dto';
import {
  ChargerSessionStatusEnum,
  PaymentMethodEnum,
  TransactionStatusEnum,
} from 'src/common/enums';
import { ValidateVoucherService } from './validate-voucher.service';

@Injectable()
export class CreatePixChargeService {
  private readonly logger = new Logger(CreatePixChargeService.name);

  constructor(
    private readonly transactionRepository: PaymentTransactionRepository,
    private readonly sessionRepository: ChargerSessionRepository,
    private readonly voucherRepository: VoucherRepository,
    private readonly chargerRepository: ChargerRepository,
    private readonly paymentGateway: PaymentGatewayPort,
    private readonly validateVoucherService: ValidateVoucherService,
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
        discountCents: existingTx.discountCents,
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
      voucherId,
      idempotencyKey: input.idempotencyKey,
      paymentMethodId: PaymentMethodEnum.PIX,
      statusId: TransactionStatusEnum.PENDING,
      amountCents: input.amountCents,
      discountCents,
      finalAmountCents,
      gatewayTransactionId: pixResult.gatewayTransactionId,
      pixPayload: pixResult.pixPayload,
      pixTxId: pixResult.pixTxId,
      pixExpiresAt: pixResult.pixExpiresAt,
    });

    if (voucherId) {
      await this.voucherRepository.incrementUsage(voucherId);
    }

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
      discountCents,
      finalAmountCents,
      qrCodeBase64: pixResult.qrCodeBase64,
    };
  }
}
