import { Module } from '@nestjs/common';
import { IntegrationsModule } from '../integrations.module';
import { MercadoPagoAdapter } from './mercado-pago.adapter';
import { PaymentGatewayPort } from './payment-gateway.port';

@Module({
  imports: [IntegrationsModule],
  providers: [
    MercadoPagoAdapter,
    {
      provide: PaymentGatewayPort,
      useExisting: MercadoPagoAdapter,
    },
  ],
  exports: [PaymentGatewayPort],
})
export class PaymentGatewayModule {}
