export type ChargerStatus = {
  isOnline: boolean;
  isCharging: boolean;
  connectorStatus: 'AVAILABLE' | 'OCCUPIED' | 'FAULTED';
};

export type ChargingTelemetry = {
  powerKw: number;
  batteryPercentage: number;
  estimatedTimeLeftMinutes: number | null;
  energyDeliveredKwh: number;
};

export abstract class ChargingTelemetryPort {
  abstract getChargerStatus(chargerId: string): Promise<ChargerStatus | null>;
  abstract getChargingTelemetry(
    sessionId: string,
  ): Promise<ChargingTelemetry | null>;
  abstract startCharging(chargerId: string): Promise<boolean | null>;
  abstract stopCharging(chargerId: string): Promise<boolean | null>;
}
