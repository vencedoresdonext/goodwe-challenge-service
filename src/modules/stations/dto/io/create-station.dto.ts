import { ApiProperty } from '@nestjs/swagger';
import {
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class CreateStationInputDTO {
  @ApiProperty({ example: 'Estação Vila Mariana' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'Rua Domingos de Morais, 1000 - São Paulo/SP' })
  @IsString()
  @IsNotEmpty()
  address!: string;

  @ApiProperty({ example: -23.5893 })
  @IsLatitude()
  latitude!: number;

  @ApiProperty({ example: -46.6395 })
  @IsLongitude()
  longitude!: number;

  @ApiProperty({
    example: 0.89,
    description: 'Preço por kWh em reais (não em centavos).',
  })
  @IsNumber()
  @Min(0)
  pricePerKwh!: number;

  @ApiProperty({ example: 50 })
  @IsNumber()
  @IsPositive()
  contractedDemandKw!: number;
}
