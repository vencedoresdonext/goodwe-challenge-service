export type StationConnectorDTO = {
  id: string;
  stationId: string;
  chargerId: string;
  connectorType: string;
  maxPowerKw: number;
  statusId: number;
  createdAt: Date;
  updatedAt: Date;
};
