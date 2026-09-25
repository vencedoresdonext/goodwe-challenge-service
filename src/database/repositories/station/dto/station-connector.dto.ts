export type StationConnectorDTO = {
  id: string;
  stationId: string;
  chargerId: string;
  connectorType: string;
  maxPowerKw: number;
  statusId: number;
  createdAt: Date;
  updatedAt: Date;
  // Dados do carregador (preço cobrado e dono)
  charger?: {
    receiverUserId: string;
    receiverCardId: string | null;
    pricePerKwhCents: number;
  };
};
