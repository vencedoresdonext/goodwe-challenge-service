import { StationDTO } from '../../../database/repositories/station/dto/station.dto';
import { StationConnectorDTO } from '../../../database/repositories/station/dto/station-connector.dto';
import { ConnectorOutputDTO, StationOutputDTO } from '../dto/io/station-io.dto';

export const centsToReais = (cents: number) => cents / 100;
export const reaisToCents = (reais: number) => Math.round(reais * 100);

export function toConnectorOutput(c: StationConnectorDTO): ConnectorOutputDTO {
  return {
    id: c.id,
    chargerId: c.chargerId,
    connectorType: c.connectorType,
    maxPowerKw: c.maxPowerKw,
    statusId: c.statusId,
    ...(c.charger && {
      pricePerKwh: centsToReais(c.charger.pricePerKwhCents),
    }),
  };
}

export function toStationOutput(s: StationDTO): StationOutputDTO {
  return {
    id: s.id,
    name: s.name,
    latitude: s.latitude,
    longitude: s.longitude,
    address: s.address,
    pricePerKwh: centsToReais(s.pricePerKwhCents),
    contractedDemandKw: s.contractedDemandKw,
    currentConsumptionKw: s.currentConsumptionKw,
    currentSolarGenerationKw: s.currentSolarGenerationKw,
    isActive: s.isActive,
    connectors: (s.connectors ?? []).map(toConnectorOutput),
  };
}
