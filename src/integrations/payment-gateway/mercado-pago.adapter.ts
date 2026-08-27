import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpClientService } from '../http/http-client.service';
import {
  PaymentGatewayPort,
  TokenizeCardInput,
  TokenizeCardOutput,
  CreatePixInput,
  CreatePixOutput,
  ChargeCreditCardInput,
  ChargeCreditCardOutput,
  CaptureOutput,
  RefundOutput,
} from './payment-gateway.port';
import * as crypto from 'crypto';

@Injectable()
export class MercadoPagoAdapter extends PaymentGatewayPort {
  private readonly logger = new Logger(MercadoPagoAdapter.name);
  private readonly baseUrl: string;
  private readonly accessToken: string;
  private readonly webhookSecret: string;
  private readonly pixExpirationMinutes: number;

  constructor(
    private readonly httpClient: HttpClientService,
    private readonly configService: ConfigService,
  ) {
    super();
    this.baseUrl = this.configService.get<string>(
      'paymentGateway.mercadoPago.baseUrl',
      'https://api.mercadopago.com',
    );
    this.accessToken = this.configService.get<string>(
      'paymentGateway.mercadoPago.accessToken',
      '',
    );
    this.webhookSecret = this.configService.get<string>(
      'paymentGateway.mercadoPago.webhookSecret',
      '',
    );
    this.pixExpirationMinutes = this.configService.get<number>(
      'paymentGateway.mercadoPago.pixExpirationMinutes',
      30,
    );
  }

  private get headers() {
    return {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    };
  }

  async tokenizeCard(data: TokenizeCardInput): Promise<TokenizeCardOutput> {
    this.logger.log('Tokenizing card via Mercado Pago');

    const response = await this.httpClient.post<any, any>(
      `${this.baseUrl}/v1/card_tokens`,
      {
        card_number: data.cardNumber,
        cardholder: {
          name: data.holderName,
          identification: {
            typeId: data.identificationType,
            number: data.identificationNumber,
          },
        },
        expiration_month: data.expirationMonth,
        expiration_year: data.expirationYear,
        security_code: data.securityCode,
      },
      this.headers,
    );

    return {
      gatewayToken: response.id,
      lastFourDigits: response.last_four_digits,
      brand: response.cardholder?.name
        ? this.mapBrand(response.first_six_digits)
        : 'unknown',
      expiresAt: new Date(
        response.date_due || Date.now() + 7 * 24 * 60 * 60 * 1000,
      ),
    };
  }

  async createPixCharge(data: CreatePixInput): Promise<CreatePixOutput> {
    this.logger.log('Creating Pix charge via Mercado Pago');

    const expiresAt = new Date();
    expiresAt.setMinutes(
      expiresAt.getMinutes() +
        (data.expirationMinutes || this.pixExpirationMinutes),
    );

    const response = await this.httpClient.post<any, any>(
      `${this.baseUrl}/v1/payments`,
      {
        transaction_amount: data.amountCents / 100,
        description: data.description,
        payment_method_id: 'pix',
        payer: { email: data.payerEmail },
        external_reference: data.externalReference,
        date_of_expiration: expiresAt.toISOString(),
      },
      this.headers,
    );

    const pixData = response.point_of_interaction?.transaction_data || {};

    return {
      gatewayTransactionId: String(response.id),
      pixPayload: pixData.qr_code || '',
      pixTxId: pixData.qr_code_base64
        ? response.external_reference
        : String(response.id),
      pixExpiresAt: expiresAt,
      qrCodeBase64: pixData.qr_code_base64,
    };
  }

  async chargeCreditCard(
    data: ChargeCreditCardInput,
  ): Promise<ChargeCreditCardOutput> {
    this.logger.log('Charging credit card via Mercado Pago');

    const response = await this.httpClient.post<any, any>(
      `${this.baseUrl}/v1/payments`,
      {
        transaction_amount: data.amountCents / 100,
        token: data.gatewayToken,
        description: data.description,
        installments: data.installments || 1,
        payment_method_id: 'credit_card',
        payer: { email: data.payerEmail },
        external_reference: data.externalReference,
        capture: data.capture ?? true,
      },
      this.headers,
    );

    return {
      gatewayTransactionId: String(response.id),
      statusId: this.mapStatus(response.statusId),
      statusDetail: response.status_detail || '',
    };
  }

  async capturePreAuthorization(
    gatewayTxId: string,
    amountCents: number,
  ): Promise<CaptureOutput> {
    this.logger.log(
      `Capturing pre-authorization ${gatewayTxId} for ${amountCents} cents`,
    );

    const response = await this.httpClient.put<any, any>(
      `${this.baseUrl}/v1/payments/${gatewayTxId}`,
      {
        transaction_amount: amountCents / 100,
        capture: true,
      },
      this.headers,
    );

    return {
      gatewayTransactionId: String(response.id),
      statusId: response.statusId,
      capturedAmountCents: Math.round(response.transaction_amount * 100),
    };
  }

  async refund(
    gatewayTxId: string,
    amountCents: number,
  ): Promise<RefundOutput> {
    this.logger.log(
      `Refunding ${amountCents} cents for transaction ${gatewayTxId}`,
    );

    const response = await this.httpClient.post<any, any>(
      `${this.baseUrl}/v1/payments/${gatewayTxId}/refunds`,
      { amount: amountCents / 100 },
      this.headers,
    );

    return {
      refundId: String(response.id),
      statusId: response.statusId,
      refundedAmountCents: Math.round(response.amount * 100),
    };
  }

  validateWebhookSignature(payload: string, signature: string): boolean {
    if (!this.webhookSecret) {
      this.logger.warn(
        'Webhook secret not configured — skipping signature validation',
      );
      return true;
    }

    const hmac = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payload)
      .digest('hex');

    const hmacBuffer = Buffer.from(hmac, 'hex');
    const signatureBuffer = Buffer.from(signature, 'hex');

    if (hmacBuffer.length !== signatureBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(hmacBuffer, signatureBuffer);
  }

  private mapStatus(mpStatus: string): 'approved' | 'pending' | 'rejected' {
    const statusMap: Record<string, 'approved' | 'pending' | 'rejected'> = {
      approved: 'approved',
      authorized: 'approved',
      pending: 'pending',
      in_process: 'pending',
      rejected: 'rejected',
      cancelled: 'rejected',
      refunded: 'rejected',
    };
    return statusMap[mpStatus] || 'pending';
  }

  private mapBrand(firstSixDigits: string): string {
    const first = firstSixDigits?.[0];
    if (first === '4') return 'visa';
    if (first === '5') return 'mastercard';
    if (first === '3') return 'amex';
    return 'other';
  }
}
