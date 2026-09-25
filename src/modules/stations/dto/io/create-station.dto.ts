import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { CreateChargerRequestDTO } from '../request/create-charger-request.dto';
import { MAX_CHARGERS_PER_REQUEST } from '../../constants/connector-types';

export class CreateStationInputDTO {
  @ApiProperty({ example: 'Estação Vila Mariana' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name!: string;

  @ApiProperty({ example: 'Rua Domingos de Morais, 1000 - São Paulo/SP' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  address!: string;

  @ApiProperty({
    example: -23.5893,
    description: 'Obtida via GET /stations/web/geocode',
  })
  @IsLatitude()
  latitude!: number;

  @ApiProperty({
    example: -46.6395,
    description: 'Obtida via GET /stations/web/geocode',
  })
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

  @ApiProperty({
    type: [CreateChargerRequestDTO],
    description:
      'Carregadores criados junto com a station (mínimo 1: a station só aparece para o dono através dos carregadores dele).',
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Adicione pelo menos um carregador.' })
  @ArrayMaxSize(MAX_CHARGERS_PER_REQUEST)
  @ValidateNested({ each: true })
  @Type(() => CreateChargerRequestDTO)
  chargers!: CreateChargerRequestDTO[];
}
