import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  IsEmail,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProcessCreditCardRequestDTO {
  @ApiProperty({
    description: 'ID do cartão do cliente',
    example: 'uuid-card-1',
  })
  @IsString()
  @IsNotEmpty()
  customerCardId: string;

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

  @ApiPropertyOptional({ description: 'Número de parcelas', example: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  installments?: number;
}
