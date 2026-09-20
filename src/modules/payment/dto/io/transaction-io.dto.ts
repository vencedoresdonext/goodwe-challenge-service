import { TransactionStatusEnum } from '../../../../common/enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaymentTransactionOutputDTO {
  @ApiProperty({ description: 'ID da transação', example: 'uuid-tx-1' })
  id: string;

  @ApiPropertyOptional({
    description: 'ID da sessão de carregamento',
    example: 'uuid-sess-1',
  })
  chargerSessionId?: string | null;

  @ApiProperty({ description: 'Valor em centavos', example: 5000 })
  amountCents: number;

  @ApiProperty({
    description: 'Status da transação',
    enum: TransactionStatusEnum,
  })
  statusId: TransactionStatusEnum;

  @ApiPropertyOptional({ description: 'ID do método de pagamento', example: 1 })
  paymentMethodId?: number | null;

  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @ApiProperty({ description: 'Data de atualização' })
  updatedAt: Date;
}
