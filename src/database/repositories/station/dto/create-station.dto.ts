export type CreateStationChargerDTO = {
  connectorType: string;
  maxPowerKw: number;
  pricePerKwhCents: number;
};

export type CreateStationDTO = {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  pricePerKwhCents: number;
  contractedDemandKw: number;
  ownerUserId: string;
  chargers: CreateStationChargerDTO[];
};
