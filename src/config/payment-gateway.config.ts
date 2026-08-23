import { registerAs } from '@nestjs/config';

export const paymentGatewayConfig = registerAs('paymentGateway', () => ({
  mercadoPago: {
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || '',
    publicKey: process.env.MERCADO_PAGO_PUBLIC_KEY || '',
    webhookSecret: process.env.MERCADO_PAGO_WEBHOOK_SECRET || '',
    baseUrl: process.env.MERCADO_PAGO_BASE_URL || 'https://api.mercadopago.com',
    pixExpirationMinutes: parseInt(
      process.env.MERCADO_PAGO_PIX_EXPIRATION_MINUTES || '30',
      10,
    ),
  },
}));
