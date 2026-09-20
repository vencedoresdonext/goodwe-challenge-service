import { IsEnum } from 'class-validator';
import { PaymentMethodEnum } from '../../../../common/enums';
import { ApiProperty } from '@nestjs/swagger';

export class StopSessionRequestDTO {
  @ApiProperty({
    description: 'Método de pagamento para finalizar',
    enum: PaymentMethodEnum,
  })
  @IsEnum(PaymentMethodEnum)
  paymentMethodId!: PaymentMethodEnum;
}
