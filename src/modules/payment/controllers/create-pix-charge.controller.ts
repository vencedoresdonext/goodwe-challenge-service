import {
  Controller,
  Post,
  Body,
  Headers,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CreatePixChargeService } from '../services/create-pix-charge.service';
import { CreatePixChargeRequestDTO } from '../dto/request/create-pix-charge-request.dto';
import { CreatePixChargeOutputDTO } from '../dto/io/create-pix-charge-io.dto';
import { type AuthenticatedUser, HttpResponse } from '../../../common/types';
import { RouteTypeGuard } from '../../../common/decorators';
import { RouteTypeEnum } from '../../../common/enums';

@Controller()
export class CreatePixChargeController {
  constructor(
    private readonly createPixChargeService: CreatePixChargeService,
  ) {}

  @Post('checkout/pix')
  @HttpCode(HttpStatus.CREATED)
  @RouteTypeGuard(RouteTypeEnum.APP)
  async handle(
    @Body() input: CreatePixChargeRequestDTO,
    @Headers('idempotency-key') idempotencyKey: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<HttpResponse<CreatePixChargeOutputDTO>> {
    const data = await this.createPixChargeService.execute({
      userId: user.sub,
      idempotencyKey,
      ...input,
    });

    return { data };
  }
}
