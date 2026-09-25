import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GeocodeResultOutputDTO {
  @ApiProperty({
    example: 'Avenida Paulista, 1578 - Bela Vista, São Paulo - SP, 01310-200',
  })
  label!: string;

  @ApiProperty({ description: 'Nome completo retornado pelo provedor' })
  displayName!: string;

  @ApiProperty({ example: -23.5614 })
  latitude!: number;

  @ApiProperty({ example: -46.6559 })
  longitude!: number;

  @ApiProperty({
    enum: ['address', 'street', 'area'],
    description:
      'address = número exato; street = só a rua; area = bairro/cidade/CEP',
  })
  precision!: 'address' | 'street' | 'area';

  @ApiPropertyOptional() city?: string;
  @ApiPropertyOptional() state?: string;
  @ApiPropertyOptional() postcode?: string;
}
