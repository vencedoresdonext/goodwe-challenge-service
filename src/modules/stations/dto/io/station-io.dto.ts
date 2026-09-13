export type StationOutputDTO = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  pricePerKwh: number;
  isActive: boolean;
  distance?: number;
  connectors?: {
    id: string;
    chargerId: string;
    connectorType: string;
    maxPowerKw: number;
    statusId: number;
  }[];
};
