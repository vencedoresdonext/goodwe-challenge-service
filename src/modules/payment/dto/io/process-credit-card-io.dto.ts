import { ApiProperty } from '@nestjs/swagger';

export class ProcessCreditCardOutputDTO {
  @ApiProperty({ description: 'ID da transação', example: 'uuid-tx-1' })
  transactionId: string;

  @ApiProperty({ description: 'ID da sessão', example: 'uuid-sess-1' })
  sessionId: string;

  @ApiProperty({ description: 'Status da transação', example: 1 })
  statusId: number;

  @ApiProperty({
    description: 'ID da transação no gateway',
    example: 'gw-tx-123',
  })
  gatewayTransactionId: string;

  @ApiProperty({ description: 'Valor em centavos', example: 5000 })
  amountCents: number;

  @ApiProperty({ description: 'Valor final em centavos', example: 5000 })
  finalAmountCents: number;
}

export class ProcessCreditCardInputDTO {
  userId: string;
  customerCardId: string;
  amountCents: number;
  chargerId: string;
  description: string;
  payerEmail: string;
  idempotencyKey: string;
  installments?: number;
}
