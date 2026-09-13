import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ProcessCreditCardPaymentService } from '../services/process-credit-card-payment.service';
import { ProcessCreditCardRequestDTO } from '../dto/request/process-credit-card-request.dto';
import { ProcessCreditCardOutputDTO } from '../dto/io/process-credit-card-io.dto';
import { type AuthenticatedUser, HttpResponse } from '../../../common/types';
import { RouteTypeGuard } from '../../../common/decorators';
import { RouteTypeEnum } from '../../../common/enums';

@Controller()
export class ProcessCreditCardController {
  constructor(
    private readonly processCreditCardService: ProcessCreditCardPaymentService,
  ) {}

  @Post('checkout/credit-card')
  @HttpCode(HttpStatus.CREATED)
  @RouteTypeGuard(RouteTypeEnum.APP)
  async handle(
    @Body() input: ProcessCreditCardRequestDTO,
    @Headers('idempotency-key') idempotencyKey: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<HttpResponse<ProcessCreditCardOutputDTO>> {
    const data = await this.processCreditCardService.execute({
      userId: user.sub,
      idempotencyKey,
      ...input,
    });

    return { data };
  }
}
