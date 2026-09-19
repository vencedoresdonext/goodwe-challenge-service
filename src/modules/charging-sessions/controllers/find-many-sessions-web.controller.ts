import { Controller, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { FindManySessionsWebService } from '../services/find-many-sessions-web.service';
import { FindManySessionsQueryParamsDTO } from '../dto/query-params/find-many-sessions-query-params.dto';
import { ChargingSessionOutputDTO } from '../dto/io/charging-session-io.dto';
import { HttpResponse } from '../../../common/types';
import { RouteTypeGuard } from '../../../common/decorators/route-type.decorator';
import { RouteTypeEnum } from '../../../common/enums';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

@Controller()
@ApiTags('Sessões de Carregamento')
@ApiBearerAuth('access')
export class FindManySessionsWebController {
  constructor(
    private readonly findManySessionsService: FindManySessionsWebService,
  ) {}

  @Get('web/sessions')
  @HttpCode(HttpStatus.OK)
  @RouteTypeGuard(RouteTypeEnum.WEB)
  @ApiOperation({
    summary: 'Rota que permite buscar várias sessões de carregamento',
  })
  @ApiQuery({ type: FindManySessionsQueryParamsDTO, required: false })
  async handle(
    @CurrentUser('sub') userId: string,
    @Query() query: FindManySessionsQueryParamsDTO,
  ): Promise<HttpResponse<ChargingSessionOutputDTO[]>> {
    const skipNum = query.skip ?? 0;
    const takeNum = query.take ?? 20;

    const data = await this.findManySessionsService.execute(
      userId,
      skipNum,
      takeNum,
    );
    return { data };
  }
}
