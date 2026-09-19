import { StationConnectorDTO } from './station-connector.dto';

export type StationDTO = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  pricePerKwhCents: number;
  contractedDemandKw: number;
  currentConsumptionKw: number;
  currentSolarGenerationKw: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  connectors?: StationConnectorDTO[];
};
