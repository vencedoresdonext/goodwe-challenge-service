import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePixChargeOutputDTO {
  @ApiProperty({ description: 'ID da transação', example: 'uuid-tx-1' })
  transactionId: string;

  @ApiProperty({ description: 'ID da sessão', example: 'uuid-sess-1' })
  sessionId: string;

  @ApiProperty({
    description: 'Payload do Pix (copia e cola)',
    example: '00020126580014BR.GOV.BCB.PIX...',
  })
  pixPayload: string;

  @ApiProperty({
    description: 'ID da transação no Pix',
    example: 'E1234567890...',
  })
  pixTxId: string;

  @ApiProperty({ description: 'Data de expiração do Pix' })
  pixExpiresAt: Date;

  @ApiProperty({ description: 'Valor em centavos', example: 5000 })
  amountCents: number;

  @ApiProperty({ description: 'Valor final em centavos', example: 5000 })
  finalAmountCents: number;

  @ApiPropertyOptional({ description: 'QR Code em Base64' })
  qrCodeBase64?: string;
}

export class CreatePixChargeInputDTO {
  userId: string;
  amountCents: number;
  chargerId: string;
  description: string;
  payerEmail: string;
  idempotencyKey: string;
}
