import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { StartSessionService } from '../services/start-session.service';
import { StartSessionRequestDTO } from '../dto/request/start-session-request.dto';
import { ChargingSessionOutputDTO } from '../dto/io/charging-session-io.dto';
import { HttpResponse } from '../../../common/types';
import { RouteTypeGuard } from '../../../common/decorators/route-type.decorator';
import { RouteTypeEnum } from '../../../common/enums';

@Controller()
export class StartSessionController {
  constructor(private readonly startSessionService: StartSessionService) {}

  @Post('start')
  @HttpCode(HttpStatus.CREATED)
  @RouteTypeGuard(RouteTypeEnum.APP)
  async handle(
    @CurrentUser('sub') userId: string,
    @Body() input: StartSessionRequestDTO,
  ): Promise<HttpResponse<ChargingSessionOutputDTO>> {
    const data = await this.startSessionService.execute(userId, input);
    return { data };
  }
}
