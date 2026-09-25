export type CreateStationDTO = {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  pricePerKwhCents: number;
  contractedDemandKw: number;
  ownerUserId: string;
  connectorType: string;
  maxPowerKw: number;
};
