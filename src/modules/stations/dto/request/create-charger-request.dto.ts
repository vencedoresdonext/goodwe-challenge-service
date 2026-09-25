import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional, Max, Min } from 'class-validator';
import {
  CONNECTOR_TYPES,
  MAX_CHARGER_POWER_KW,
} from '../../constants/connector-types';

export class CreateChargerRequestDTO {
  @ApiProperty({ enum: CONNECTOR_TYPES, example: 'TYPE2' })
  @IsIn(CONNECTOR_TYPES, {
    message: `Tipo de conector inválido. Use: ${CONNECTOR_TYPES.join(', ')}.`,
  })
  connectorType!: string;

  @ApiProperty({ example: 22, description: 'Potência máxima em kW' })
  @IsNumber()
  @Min(1)
  @Max(MAX_CHARGER_POWER_KW)
  maxPowerKw!: number;

  @ApiPropertyOptional({
    example: 0.89,
    description: 'Preço por kWh em reais. Se omitido, usa o preço da station.',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  pricePerKwh?: number;
}
