import { Module } from '@nestjs/common';
import { PaymentGatewayModule } from './payment-gateway/payment-gateway.module';
import { ChargingTelemetryModule } from './http/charging-telemetry/charging-telemetry.module';
import { GeocodingModule } from './geocoding/geocoding.module';

/**
 * Módulo de integrações com APIs externas.
 * - PaymentGatewayModule (MercadoPago)
 * - ChargingTelemetryModule (Telemetria mock)
 * - GeocodingModule (endereço -> coordenadas, via Nominatim/OpenStreetMap)
 */
@Module({
  imports: [PaymentGatewayModule, ChargingTelemetryModule, GeocodingModule],
  exports: [PaymentGatewayModule, ChargingTelemetryModule, GeocodingModule],
})
export class IntegrationsModule {}
