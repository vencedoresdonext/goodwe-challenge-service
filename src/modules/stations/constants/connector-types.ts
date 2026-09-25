export const CONNECTOR_TYPES = [
  'TYPE2',
  'CCS2',
  'CHADEMO',
  'GBT',
  'TYPE1',
] as const;

export type ConnectorType = (typeof CONNECTOR_TYPES)[number];

export const MAX_CHARGER_POWER_KW = 400;
export const MAX_CHARGERS_PER_REQUEST = 20;
