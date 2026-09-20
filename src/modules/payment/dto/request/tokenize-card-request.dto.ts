import { IsString, IsNotEmpty, IsInt, Min, Max, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TokenizeCardRequestDTO {
  @ApiProperty({ description: 'Número do cartão', example: '0000000000000000' })
  @IsString()
  @IsNotEmpty()
  cardNumber: string;

  @ApiProperty({
    description: 'Nome impresso no cartão',
    example: 'João Silva',
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  holderName: string;

  @ApiProperty({ description: 'Mês de expiração', example: 12 })
  @IsInt()
  @Min(1)
  @Max(12)
  expirationMonth: number;

  @ApiProperty({ description: 'Ano de expiração', example: 2028 })
  @IsInt()
  @Min(2024)
  expirationYear: number;

  @ApiProperty({ description: 'Código de segurança', example: '123' })
  @IsString()
  @IsNotEmpty()
  securityCode: string;

  @ApiProperty({
    description: 'Tipo de documento (ex: CPF, CNPJ)',
    example: 'CPF',
  })
  @IsString()
  @IsNotEmpty()
  identificationType: string;

  @ApiProperty({ description: 'Número do documento', example: '12345678901' })
  @IsString()
  @IsNotEmpty()
  identificationNumber: string;
}
