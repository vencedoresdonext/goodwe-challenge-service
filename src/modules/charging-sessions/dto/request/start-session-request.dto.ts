import { IsNotEmpty, IsOptional, IsString, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StartSessionRequestDTO {
  @ApiProperty({ description: 'ID do carregador', example: 'uuid-1234' })
  @IsString()
  @IsNotEmpty()
  chargerId!: string;

  @ApiPropertyOptional({
    description: 'ID do veículo (opcional)',
    example: 'uuid-vehicle-1',
  })
  @IsString()
  @IsOptional()
  vehicleId?: string;

  @ApiProperty({
    description: 'Valor pré-autorizado em centavos',
    example: 5000,
  })
  @IsInt()
  @Min(0)
  preAuthorizedAmountCents!: number;
}
