import { Controller, Get, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { FindSessionStatusService } from '../services/find-session-status.service';
import { ChargingSessionOutputDTO } from '../dto/io/charging-session-io.dto';
import { HttpResponse } from '../../../common/types';
import { RouteTypeGuard } from '../../../common/decorators/route-type.decorator';
import { RouteTypeEnum } from '../../../common/enums';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

@Controller()
@ApiTags('Sessões de Carregamento')
@ApiBearerAuth('access')
export class FindSessionStatusController {
  constructor(
    private readonly getSessionStatusService: FindSessionStatusService,
  ) {}

  @Get(':id/status')
  @HttpCode(HttpStatus.OK)
  @RouteTypeGuard(RouteTypeEnum.APP)
  @ApiOperation({
    summary: 'Rota que permite buscar o status de uma sessão de carregamento',
  })
  @ApiParam({ name: 'sessionId', type: String })
  async handle(
    @CurrentUser('sub') userId: string,
    @Param('id') sessionId: string,
  ): Promise<HttpResponse<ChargingSessionOutputDTO>> {
    const data = await this.getSessionStatusService.execute(userId, sessionId);
    return { data };
  }
}
