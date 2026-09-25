import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ConnectorOutputDTO {
  @ApiProperty({ description: 'ID do conector' })
  id: string;

  @ApiProperty({ description: 'ID do carregador' })
  chargerId: string;

  @ApiProperty({ description: 'Tipo do conector', example: 'Type 2' })
  connectorType: string;

  @ApiProperty({ description: 'Potência máxima em kW', example: 22 })
  maxPowerKw: number;

  @ApiProperty({ description: 'ID do status do conector', example: 1 })
  statusId: number;

  @ApiPropertyOptional({
    description: 'Preço por kWh cobrado por este carregador (reais)',
    example: 0.89,
  })
  pricePerKwh?: number;
}

export class StationOutputDTO {
  @ApiProperty({ description: 'ID da estação', example: 'uuid-1234' })
  id: string;

  @ApiProperty({ description: 'Nome da estação', example: 'Estação Central' })
  name: string;

  @ApiProperty({ description: 'Latitude', example: -23.55052 })
  latitude: number;

  @ApiProperty({ description: 'Longitude', example: -46.633308 })
  longitude: number;

  @ApiProperty({ description: 'Endereço completo da estação' })
  address: string;

  @ApiProperty({ description: 'Preço por kWh', example: 1.5 })
  pricePerKwh: number;

  @ApiProperty({ description: 'Demanda contratada em kW', example: 100 })
  contractedDemandKw: number;

  @ApiProperty({ description: 'Consumo atual em kW', example: 45.5 })
  currentConsumptionKw: number;

  @ApiProperty({ description: 'Geração solar atual em kW', example: 15.2 })
  currentSolarGenerationKw: number;

  @ApiProperty({ description: 'Indica se a estação está ativa' })
  isActive: boolean;

  @ApiPropertyOptional({
    description: 'Distância em km (se calculado)',
    example: 2.5,
  })
  distance?: number;

  @ApiPropertyOptional({
    description: 'Lista de conectores da estação',
    type: [ConnectorOutputDTO],
  })
  connectors?: ConnectorOutputDTO[];
}
