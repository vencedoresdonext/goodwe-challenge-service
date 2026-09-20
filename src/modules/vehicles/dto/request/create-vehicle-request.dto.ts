import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVehicleRequestDTO {
  @ApiProperty({ description: 'Placa do veículo', example: 'ABC1D23' })
  @IsString()
  @IsNotEmpty()
  plate!: string;

  @ApiProperty({ description: 'Marca do veículo', example: 'Tesla' })
  @IsString()
  @IsNotEmpty()
  brand!: string;

  @ApiProperty({ description: 'Modelo do veículo', example: 'Model S' })
  @IsString()
  @IsNotEmpty()
  model!: string;

  @ApiProperty({
    description: 'Ícone do veículo',
    example: 'car-icon-1',
    required: false,
  })
  @IsOptional()
  @IsString()
  icon?: string;
}
