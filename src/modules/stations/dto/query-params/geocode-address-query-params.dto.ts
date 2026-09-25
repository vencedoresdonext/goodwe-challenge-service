import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class GeocodeAddressQueryParamsDTO {
  @ApiProperty({ example: 'Av. Paulista, 1578 - São Paulo' })
  @IsString()
  @MinLength(5, { message: 'Digite pelo menos 5 caracteres do endereço.' })
  @MaxLength(255)
  address!: string;
}
