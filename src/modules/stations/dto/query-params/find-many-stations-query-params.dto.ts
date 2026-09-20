import { IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FindManyStationsQueryParamsDTO {
  @ApiProperty({ description: 'Latitude atual do usuário', example: -23.55052 })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  latitude!: number;

  @ApiProperty({
    description: 'Longitude atual do usuário',
    example: -46.633308,
  })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  longitude!: number;

  @ApiPropertyOptional({ description: 'Raio de busca em km', default: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  radiusKm?: number = 10;
}
