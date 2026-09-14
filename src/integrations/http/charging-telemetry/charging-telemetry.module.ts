import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ChargingTelemetryPort } from './charging-telemetry.port';
import { ChargingTelemetryHttpAdapter } from './charging-telemetry-http.adapter';

@Module({
  imports: [HttpModule],
  providers: [
    {
      provide: ChargingTelemetryPort,
      useClass: ChargingTelemetryHttpAdapter,
    },
  ],
  exports: [ChargingTelemetryPort],
})
export class ChargingTelemetryModule {}
