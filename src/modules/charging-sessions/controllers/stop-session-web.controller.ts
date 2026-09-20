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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiOkResponse,
} from '@nestjs/swagger';

@Controller()
@ApiTags('Sessões de Carregamento')
@ApiBearerAuth('access')
export class StopSessionWebController {
  constructor(private readonly stopSessionService: StopSessionService) {}

  @Post('web/:id/stop')
  @HttpCode(HttpStatus.CREATED)
  @RouteTypeGuard(RouteTypeEnum.WEB)
  @ApiOperation({
    summary: 'Rota que permite parar uma sessão de carregamento na WEB',
  })
  @ApiOkResponse({
    type: ChargingSessionOutputDTO,
    description: 'Sessão finalizada com sucesso',
  })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: StopSessionRequestDTO })
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
