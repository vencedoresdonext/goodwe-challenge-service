import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ChargerSessionStatusEnum } from '../../../../common/enums';

export class SessionTelemetryOutputDTO {
  @ApiProperty({ description: 'Potência atual em kW', example: 50.5 })
  powerKw: number;

  @ApiProperty({ description: 'Porcentagem da bateria', example: 80 })
  batteryPercentage: number;

  @ApiProperty({
    description: 'Tempo estimado restante em minutos',
    example: 15,
    nullable: true,
  })
  estimatedTimeLeftMinutes: number | null;
}

export class ChargingSessionOutputDTO {
  @ApiProperty({ description: 'ID da sessão', example: 'uuid-1234' })
  id: string;

  @ApiProperty({ description: 'ID do usuário', example: 'uuid-user-1' })
  userId: string;

  @ApiProperty({
    description: 'ID do veículo',
    example: 'uuid-vehicle-1',
    nullable: true,
  })
  vehicleId: string | null;

  @ApiProperty({ description: 'ID do carregador', example: 'uuid-charger-1' })
  chargerId: string;

  @ApiProperty({
    description: 'Status da sessão',
    enum: ChargerSessionStatusEnum,
  })
  statusId: ChargerSessionStatusEnum;

  @ApiProperty({ description: 'Valor consumido em centavos', example: 1500 })
  consumedAmountCents: number;

  @ApiProperty({ description: 'Energia entregue em kWh', example: 10.5 })
  energyDeliveredKwh: number;

  @ApiProperty({ description: 'Data de início', nullable: true })
  startedAt: Date | null;

  @ApiProperty({ description: 'Data de fim', nullable: true })
  finishedAt: Date | null;

  @ApiPropertyOptional({
    description: 'Telemetria da sessão',
    type: SessionTelemetryOutputDTO,
  })
  telemetry?: SessionTelemetryOutputDTO;
}
