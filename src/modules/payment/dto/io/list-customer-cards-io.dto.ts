import { ApiProperty } from '@nestjs/swagger';

export class ListCustomerCardsOutputDTO {
  @ApiProperty({ description: 'ID do cartão', example: 'uuid-card-1' })
  id: string;

  @ApiProperty({
    description: 'Últimos quatro dígitos do cartão',
    example: '1234',
  })
  lastFourDigits: string;

  @ApiProperty({ description: 'Bandeira do cartão', example: 'visa' })
  brand: string;

  @ApiProperty({ description: 'Nome do titular', example: 'João Silva' })
  holderName: string;

  @ApiProperty({ description: 'Data de expiração' })
  expiresAt: Date;

  @ApiProperty({ description: 'Se é o cartão principal', example: true })
  isDefault: boolean;
}
