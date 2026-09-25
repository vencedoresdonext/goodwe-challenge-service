import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import type { EnergyPeriod } from '../../utils/energy-aggregation';

export const ENERGY_PERIODS: EnergyPeriod[] = ['24h', '7d', '30d'];

export class EnergyDashboardQueryParamsDTO {
  @ApiPropertyOptional({ enum: ENERGY_PERIODS, default: '7d' })
  @IsOptional()
  @IsIn(ENERGY_PERIODS)
  period?: EnergyPeriod = '7d';

  @ApiPropertyOptional({
    description:
      'Se informado, o gráfico é da station, com uma série por carregador',
  })
  @IsOptional()
  @IsUUID('4')
  stationId?: string;

  @ApiPropertyOptional({
    description:
      'Fuso do usuário em minutos, igual ao Date.getTimezoneOffset() do JS (Brasília = 180)',
    default: 180,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-840)
  @Max(840)
  tzOffset?: number = 180;
}
