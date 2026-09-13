import { IsEnum } from 'class-validator';
import { PaymentMethodEnum } from '../../../../common/enums';

export class StopSessionRequestDTO {
  @IsEnum(PaymentMethodEnum)
  paymentMethodId!: PaymentMethodEnum;
}
