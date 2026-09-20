import { Module } from '@nestjs/common';
import { HttpClientModule } from '../http/http-client.module';
import { MercadoPagoAdapter } from './mercado-pago.adapter';
import { PaymentGatewayPort } from './payment-gateway.port';

@Module({
  imports: [HttpClientModule],
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
