import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EnergySeriesOutputDTO {
  @ApiProperty({ description: 'ID da station ou do carregador' })
  key!: string;

  @ApiProperty({ example: 'Estação Vila Mariana' })
  label!: string;

  @ApiProperty({ description: 'Potência instalada da série (kW)' })
  installedKw!: number;

  @ApiPropertyOptional({ description: 'Demanda contratada (só por station)' })
  contractedDemandKw?: number;
}

export class EnergySeriesValueOutputDTO {
  @ApiProperty() energyKwh!: number;
  @ApiProperty() avgPowerKw!: number;
}

export class EnergyPointOutputDTO {
  @ApiProperty() start!: string;
  @ApiProperty() end!: string;

  @ApiProperty({
    description: 'Valores por série, indexados pela key da série',
    type: 'object',
    additionalProperties: {
      type: 'object',
      properties: {
        energyKwh: { type: 'number' },
        avgPowerKw: { type: 'number' },
      },
    },
  })
  series!: Record<string, EnergySeriesValueOutputDTO>;

  @ApiProperty() totalEnergyKwh!: number;
  @ApiProperty({ description: 'Potência média no intervalo (kW)' })
  avgPowerKw!: number;
  @ApiProperty({ description: 'Pico de potência simultânea no intervalo (kW)' })
  peakPowerKw!: number;
  @ApiProperty() revenueCents!: number;
  @ApiProperty() sessions!: number;
}

export class EnergyTotalsOutputDTO {
  @ApiProperty() energyKwh!: number;
  @ApiProperty() revenueCents!: number;
  @ApiProperty() sessions!: number;
  @ApiProperty() avgPowerKw!: number;
  @ApiProperty() peakPowerKw!: number;
  @ApiPropertyOptional({ nullable: true }) peakAt!: string | null;
  @ApiProperty() contractedDemandKw!: number;
  @ApiProperty() installedKw!: number;
}

export class EnergyDashboardOutputDTO {
  @ApiProperty({ enum: ['24h', '7d', '30d'] }) period!: string;
  @ApiProperty({ enum: ['station', 'charger'] }) groupBy!:
    | 'station'
    | 'charger';
  @ApiProperty() from!: string;
  @ApiProperty() to!: string;
  @ApiProperty() bucketMinutes!: number;
  @ApiProperty({ type: [EnergySeriesOutputDTO] })
  series!: EnergySeriesOutputDTO[];
  @ApiProperty({ type: [EnergyPointOutputDTO] })
  points!: EnergyPointOutputDTO[];
  @ApiProperty({ type: EnergyTotalsOutputDTO })
  totals!: EnergyTotalsOutputDTO;
}
