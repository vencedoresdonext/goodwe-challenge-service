import { ApiProperty } from '@nestjs/swagger';

export class TokenizeCardInputDTO {
  userId: string;
  cardNumber: string;
  holderName: string;
  expirationMonth: number;
  expirationYear: number;
  securityCode: string;
  identificationType: string;
  identificationNumber: string;
}

export class TokenizeCardOutputDTO {
  @ApiProperty({
    description: 'ID do cartão tokenizado',
    example: 'uuid-card-1',
  })
  id: string;

  @ApiProperty({
    description: 'Últimos quatro dígitos do cartão',
    example: '1234',
  })
  lastFourDigits: string;

  @ApiProperty({ description: 'Bandeira do cartão', example: 'mastercard' })
  brand: string;

  @ApiProperty({ description: 'Nome do titular', example: 'Maria Souza' })
  holderName: string;

  @ApiProperty({ description: 'Data de expiração' })
  expiresAt: Date;

  @ApiProperty({ description: 'Se é o cartão principal', example: false })
  isDefault: boolean;
}
