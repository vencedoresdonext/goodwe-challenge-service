import { Module } from '@nestjs/common';
import { PaymentGatewayModule } from './payment-gateway/payment-gateway.module';
import { ChargingTelemetryModule } from './http/charging-telemetry/charging-telemetry.module';

/**
 * Módulo de integrações com APIs externas.
 * - PaymentGatewayModule (MercadoPago)
 * - ChargingTelemetryModule (Telemetria mock)
 */
@Module({
  imports: [PaymentGatewayModule, ChargingTelemetryModule],
  exports: [PaymentGatewayModule, ChargingTelemetryModule],
})
export class IntegrationsModule {}
