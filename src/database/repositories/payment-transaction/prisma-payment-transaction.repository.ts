import { PaymentTransactionDTO } from './dto/payment-transaction.dto';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { PaymentTransactionRepository } from './payment-transaction.repository';
import { CreatePaymentTransactionDTO } from './dto/create-payment-transaction.dto';

@Injectable()
export class PrismaPaymentTransactionRepository implements PaymentTransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreatePaymentTransactionDTO): Promise<PaymentTransactionDTO> {
    return this.prisma.paymentTransaction.create({
      data,
      select: {
        id: true,
        userId: true,
        chargerSessionId: true,
        idempotencyKey: true,
        paymentMethodId: true,
        statusId: true,
        amountCents: true,
        discountCents: true,
        finalAmountCents: true,
        gatewayTransactionId: true,
        pixPayload: true,
        pixTxId: true,
        pixExpiresAt: true,
        customerCardId: true,
        failureReason: true,
        gatewayMetadata: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  findById(id: string): Promise<PaymentTransactionDTO | null> {
    return this.prisma.paymentTransaction.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        chargerSessionId: true,
        idempotencyKey: true,
        paymentMethodId: true,
        statusId: true,
        amountCents: true,
        discountCents: true,
        finalAmountCents: true,
        gatewayTransactionId: true,
        pixPayload: true,
        pixTxId: true,
        pixExpiresAt: true,
        customerCardId: true,
        failureReason: true,
        gatewayMetadata: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  findByIdempotencyKey(key: string): Promise<PaymentTransactionDTO | null> {
    return this.prisma.paymentTransaction.findUnique({
      where: { idempotencyKey: key },
      select: {
        id: true,
        userId: true,
        chargerSessionId: true,
        idempotencyKey: true,
        paymentMethodId: true,
        statusId: true,
        amountCents: true,
        discountCents: true,
        finalAmountCents: true,
        gatewayTransactionId: true,
        pixPayload: true,
        pixTxId: true,
        pixExpiresAt: true,
        customerCardId: true,
        failureReason: true,
        gatewayMetadata: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  findByGatewayTransactionId(
    gatewayTxId: string,
  ): Promise<PaymentTransactionDTO | null> {
    return this.prisma.paymentTransaction.findFirst({
      where: { gatewayTransactionId: gatewayTxId },
      select: {
        id: true,
        userId: true,
        chargerSessionId: true,
        idempotencyKey: true,
        paymentMethodId: true,
        statusId: true,
        amountCents: true,
        discountCents: true,
        finalAmountCents: true,
        gatewayTransactionId: true,
        pixPayload: true,
        pixTxId: true,
        pixExpiresAt: true,
        customerCardId: true,
        failureReason: true,
        gatewayMetadata: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  findByPixTxId(txId: string): Promise<PaymentTransactionDTO | null> {
    return this.prisma.paymentTransaction.findFirst({
      where: { pixTxId: txId },
      select: {
        id: true,
        userId: true,
        chargerSessionId: true,
        idempotencyKey: true,
        paymentMethodId: true,
        statusId: true,
        amountCents: true,
        discountCents: true,
        finalAmountCents: true,
        gatewayTransactionId: true,
        pixPayload: true,
        pixTxId: true,
        pixExpiresAt: true,
        customerCardId: true,
        failureReason: true,
        gatewayMetadata: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  updateStatus(
    id: string,
    statusId: number,
    metadata?: { failureReason?: string; gatewayMetadata?: string },
  ): Promise<PaymentTransactionDTO> {
    return this.prisma.paymentTransaction.update({
      where: { id },
      data: {
        statusId,
        ...(metadata?.failureReason && {
          failureReason: metadata.failureReason,
        }),
        ...(metadata?.gatewayMetadata && {
          gatewayMetadata: metadata.gatewayMetadata,
        }),
      },
      select: {
        id: true,
        userId: true,
        chargerSessionId: true,
        idempotencyKey: true,
        paymentMethodId: true,
        statusId: true,
        amountCents: true,
        discountCents: true,
        finalAmountCents: true,
        gatewayTransactionId: true,
        pixPayload: true,
        pixTxId: true,
        pixExpiresAt: true,
        customerCardId: true,
        failureReason: true,
        gatewayMetadata: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  findByUserId(
    userId: string,
    skip: number,
    take: number,
  ): Promise<PaymentTransactionDTO[]> {
    return this.prisma.paymentTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      select: {
        id: true,
        userId: true,
        chargerSessionId: true,
        idempotencyKey: true,
        paymentMethodId: true,
        statusId: true,
        amountCents: true,
        discountCents: true,
        finalAmountCents: true,
        gatewayTransactionId: true,
        pixPayload: true,
        pixTxId: true,
        pixExpiresAt: true,
        customerCardId: true,
        failureReason: true,
        gatewayMetadata: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
