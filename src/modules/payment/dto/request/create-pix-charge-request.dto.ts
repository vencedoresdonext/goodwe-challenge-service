import { IsString, IsNotEmpty, IsInt, Min, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePixChargeRequestDTO {
  @ApiProperty({ description: 'Valor em centavos', example: 5000 })
  @IsInt()
  @Min(1)
  amountCents: number;

  @ApiProperty({ description: 'ID do carregador', example: 'uuid-charger-1' })
  @IsString()
  @IsNotEmpty()
  chargerId: string;

  @ApiProperty({ description: 'Descrição da cobrança', example: 'Recarga' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Email do pagador',
    example: 'cliente@email.com',
  })
  @IsEmail()
  payerEmail: string;
}
