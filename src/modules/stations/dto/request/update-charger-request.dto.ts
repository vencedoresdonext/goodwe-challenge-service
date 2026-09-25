import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { ConnectorStatusEnum } from '../../../../common/enums';
import {
  CONNECTOR_TYPES,
  MAX_CHARGER_POWER_KW,
} from '../../constants/connector-types';

export const EDITABLE_CONNECTOR_STATUSES = [
  ConnectorStatusEnum.AVAILABLE,
  ConnectorStatusEnum.OFFLINE,
  ConnectorStatusEnum.FAULTED,
] as const;

export class UpdateChargerRequestDTO {
  @ApiPropertyOptional({ enum: CONNECTOR_TYPES, example: 'CCS2' })
  @IsOptional()
  @IsIn(CONNECTOR_TYPES, {
    message: `Tipo de conector inválido. Use: ${CONNECTOR_TYPES.join(', ')}.`,
  })
  connectorType?: string;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(MAX_CHARGER_POWER_KW)
  maxPowerKw?: number;

  @ApiPropertyOptional({ example: 1.2, description: 'Preço por kWh em reais' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  pricePerKwh?: number;

  @ApiPropertyOptional({
    enum: EDITABLE_CONNECTOR_STATUSES,
    description: '1 = Livre, 3 = Offline (manutenção), 4 = Com falha',
  })
  @IsOptional()
  @IsIn(EDITABLE_CONNECTOR_STATUSES, {
    message: 'Status inválido. Use 1 (livre), 3 (offline) ou 4 (com falha).',
  })
  statusId?: number;
}
