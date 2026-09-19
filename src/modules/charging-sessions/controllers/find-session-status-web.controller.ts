import { Controller, Get, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { FindSessionStatusWebService } from '../services/find-session-status-web.service';
import { ChargingSessionOutputDTO } from '../dto/io/charging-session-io.dto';
import { HttpResponse } from '../../../common/types';
import { RouteTypeGuard } from '../../../common/decorators/route-type.decorator';
import { RouteTypeEnum } from '../../../common/enums';

@Controller()
export class FindSessionStatusWebController {
  constructor(
    private readonly getSessionStatusService: FindSessionStatusWebService,
  ) {}

  @Get('web/:id/status')
  @HttpCode(HttpStatus.OK)
  @RouteTypeGuard(RouteTypeEnum.WEB)
  async handle(
    @CurrentUser('sub') userId: string,
    @Param('id') sessionId: string,
  ): Promise<HttpResponse<ChargingSessionOutputDTO>> {
    const data = await this.getSessionStatusService.execute(userId, sessionId);
    return { data };
  }
}
