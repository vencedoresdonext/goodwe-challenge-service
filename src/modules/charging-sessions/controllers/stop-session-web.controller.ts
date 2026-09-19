import {
  Controller,
  Post,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { StopSessionService } from '../services/stop-session.service';
import { StopSessionRequestDTO } from '../dto/request/stop-session-request.dto';
import { ChargingSessionOutputDTO } from '../dto/io/charging-session-io.dto';
import { HttpResponse } from '../../../common/types';
import { RouteTypeGuard } from '../../../common/decorators/route-type.decorator';
import { RouteTypeEnum } from '../../../common/enums';

@Controller()
export class StopSessionWebController {
  constructor(private readonly stopSessionService: StopSessionService) {}

  @Post('web/:id/stop')
  @HttpCode(HttpStatus.CREATED)
  @RouteTypeGuard(RouteTypeEnum.WEB)
  async handle(
    @CurrentUser('sub') userId: string,
    @Param('id') sessionId: string,
    @Body() input: StopSessionRequestDTO,
  ): Promise<HttpResponse<ChargingSessionOutputDTO>> {
    const data = await this.stopSessionService.execute(
      userId,
      sessionId,
      input,
    );
    return { data };
  }
}
