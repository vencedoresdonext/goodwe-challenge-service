import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { StartSessionService } from '../services/start-session.service';
import { StartSessionRequestDTO } from '../dto/request/start-session-request.dto';
import { ChargingSessionOutputDTO } from '../dto/io/charging-session-io.dto';
import { HttpResponse } from '../../../common/types';
import { RouteTypeGuard } from '../../../common/decorators/route-type.decorator';
import { RouteTypeEnum } from '../../../common/enums';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiTags,
  ApiCreatedResponse,
} from '@nestjs/swagger';

@Controller()
@ApiTags('Sessões de Carregamento')
@ApiBearerAuth('access')
export class StartSessionWebController {
  constructor(private readonly startSessionService: StartSessionService) {}

  @Post('web/start')
  @HttpCode(HttpStatus.CREATED)
  @RouteTypeGuard(RouteTypeEnum.WEB)
  @ApiOperation({
    summary: 'Rota que permite iniciar uma sessão de carregamento na WEB',
  })
  @ApiCreatedResponse({
    type: ChargingSessionOutputDTO,
    description: 'Sessão iniciada com sucesso',
  })
  @ApiBody({ type: StartSessionRequestDTO })
  async handle(
    @CurrentUser('sub') userId: string,
    @Body() input: StartSessionRequestDTO,
  ): Promise<HttpResponse<ChargingSessionOutputDTO>> {
    const data = await this.startSessionService.execute(userId, input);
    return { data };
  }
}
