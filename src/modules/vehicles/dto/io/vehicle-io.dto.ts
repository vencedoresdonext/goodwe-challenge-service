import { ApiProperty } from '@nestjs/swagger';

export class VehicleOutputDTO {
  @ApiProperty({ description: 'ID do veículo', example: 'uuid-1234' })
  id: string;

  @ApiProperty({ description: 'Placa do veículo', example: 'ABC1D23' })
  plate: string;

  @ApiProperty({ description: 'Marca do veículo', example: 'Tesla' })
  brand: string;

  @ApiProperty({ description: 'Modelo do veículo', example: 'Model S' })
  model: string;

  @ApiProperty({ description: 'Ícone do veículo', example: 'car-icon-1' })
  icon: string;

  @ApiProperty({ description: 'Veículo está ativo?' })
  isActive: boolean;

  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;
}
