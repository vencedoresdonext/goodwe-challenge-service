import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoAdapter } from './mercado-pago.adapter';
import { HttpClientService } from '../http/http-client.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as crypto from 'crypto';

describe('MercadoPagoAdapter', () => {
  let adapter: MercadoPagoAdapter;

  const mockHttpClientService = {
    post: vi.fn(),
    put: vi.fn(),
  };

  const mockConfigService = {
    get: vi.fn((key: string, defaultValue?: any) => {
      switch (key) {
        case 'paymentGateway.mercadoPago.baseUrl':
          return 'https://api.test.mercadopago.com';
        case 'paymentGateway.mercadoPago.accessToken':
          return 'test-access-token';
        case 'paymentGateway.mercadoPago.webhookSecret':
          return 'test-webhook-secret';
        case 'paymentGateway.mercadoPago.pixExpirationMinutes':
          return 30;
        default:
          return defaultValue;
      }
    }),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MercadoPagoAdapter,
        {
          provide: HttpClientService,
          useValue: mockHttpClientService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    adapter = module.get<MercadoPagoAdapter>(MercadoPagoAdapter);
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  describe('tokenizeCard', () => {
    it('should tokenize a card successfully', async () => {
      const input = {
        cardNumber: '1234567890123456',
        holderName: 'John Doe',
        identificationType: 'CPF',
        identificationNumber: '12345678909',
        expirationMonth: 12,
        expirationYear: 2030,
        securityCode: '123',
      };

      const mockResponse = {
        id: 'token-id-123',
        last_four_digits: '3456',
        first_six_digits: '412345',
        cardholder: { name: 'John Doe' },
        date_due: new Date(Date.now() + 86400000).toISOString(),
      };

      mockHttpClientService.post.mockResolvedValueOnce(mockResponse);

      const result = await adapter.tokenizeCard(input);

      expect(mockHttpClientService.post).toHaveBeenCalledWith(
        'https://api.test.mercadopago.com/v1/card_tokens',
        {
          card_number: input.cardNumber,
          cardholder: {
            name: input.holderName,
            identification: {
              typeId: input.identificationType,
              number: input.identificationNumber,
            },
          },
          expiration_month: input.expirationMonth,
          expiration_year: input.expirationYear,
          security_code: input.securityCode,
        },
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-access-token',
          }),
        }),
      );

      expect(result).toEqual({
        gatewayToken: 'token-id-123',
        lastFourDigits: '3456',
        brand: 'visa',
        expiresAt: expect.any(Date),
      });
    });
  });

  describe('createPixCharge', () => {
    it('should create a Pix charge successfully', async () => {
      const input = {
        amountCents: 15000,
        description: 'Test Pix',
        payerEmail: 'test@test.com',
        externalReference: 'ext-ref-123',
      };

      const mockResponse = {
        id: 'pix-id-123',
        external_reference: 'ext-ref-123',
        point_of_interaction: {
          transaction_data: {
            qr_code: 'qr-code-payload',
            qr_code_base64: 'base64-string',
          },
        },
      };

      mockHttpClientService.post.mockResolvedValueOnce(mockResponse);

      const result = await adapter.createPixCharge(input);

      expect(mockHttpClientService.post).toHaveBeenCalledWith(
        'https://api.test.mercadopago.com/v1/payments',
        expect.objectContaining({
          transaction_amount: 150,
          payment_method_id: 'pix',
          external_reference: 'ext-ref-123',
        }),
        expect.any(Object),
      );

      expect(result).toEqual({
        gatewayTransactionId: 'pix-id-123',
        pixPayload: 'qr-code-payload',
        pixTxId: 'ext-ref-123',
        pixExpiresAt: expect.any(Date),
        qrCodeBase64: 'base64-string',
      });
    });
  });

  describe('chargeCreditCard', () => {
    it('should charge a credit card successfully', async () => {
      const input = {
        amountCents: 10000,
        gatewayToken: 'token-123',
        description: 'Test Card',
        payerEmail: 'test@test.com',
        externalReference: 'ext-ref-123',
      };

      const mockResponse = {
        id: 'tx-id-123',
        statusId: 'approved',
        status_detail: 'accredited',
      };

      mockHttpClientService.post.mockResolvedValueOnce(mockResponse);

      const result = await adapter.chargeCreditCard(input);

      expect(mockHttpClientService.post).toHaveBeenCalledWith(
        'https://api.test.mercadopago.com/v1/payments',
        expect.objectContaining({
          transaction_amount: 100,
          token: 'token-123',
          payment_method_id: 'credit_card',
        }),
        expect.any(Object),
      );

      expect(result).toEqual({
        gatewayTransactionId: 'tx-id-123',
        statusId: 'approved',
        statusDetail: 'accredited',
      });
    });
  });

  describe('capturePreAuthorization', () => {
    it('should capture a pre-authorization successfully', async () => {
      const mockResponse = {
        id: 'tx-id-123',
        statusId: 'approved',
        transaction_amount: 50.5,
      };

      mockHttpClientService.put.mockResolvedValueOnce(mockResponse);

      const result = await adapter.capturePreAuthorization('tx-id-123', 5050);

      expect(mockHttpClientService.put).toHaveBeenCalledWith(
        'https://api.test.mercadopago.com/v1/payments/tx-id-123',
        {
          transaction_amount: 50.5,
          capture: true,
        },
        expect.any(Object),
      );

      expect(result).toEqual({
        gatewayTransactionId: 'tx-id-123',
        statusId: 'approved',
        capturedAmountCents: 5050,
      });
    });
  });

  describe('refund', () => {
    it('should refund a transaction successfully', async () => {
      const mockResponse = {
        id: 'refund-id-123',
        statusId: 'approved',
        amount: 25.0,
      };

      mockHttpClientService.post.mockResolvedValueOnce(mockResponse);

      const result = await adapter.refund('tx-id-123', 2500);

      expect(mockHttpClientService.post).toHaveBeenCalledWith(
        'https://api.test.mercadopago.com/v1/payments/tx-id-123/refunds',
        { amount: 25.0 },
        expect.any(Object),
      );

      expect(result).toEqual({
        refundId: 'refund-id-123',
        statusId: 'approved',
        refundedAmountCents: 2500,
      });
    });
  });

  describe('validateWebhookSignature', () => {
    it('should validate a correct signature', () => {
      const payload = '{"id":"test"}';
      const hmac = crypto
        .createHmac('sha256', 'test-webhook-secret')
        .update(payload)
        .digest('hex');

      const isValid = adapter.validateWebhookSignature(payload, hmac);
      expect(isValid).toBe(true);
    });

    it('should reject an incorrect signature', () => {
      const payload = '{"id":"test"}';
      const isValid = adapter.validateWebhookSignature(
        payload,
        'invalid-signature',
      );
      expect(isValid).toBe(false);
    });
  });
});
