import { Controller, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { FindManyStationsService } from '../services/find-many-stations.service';
import { FindManyStationsQueryParamsDTO } from '../dto/query-params/find-many-stations-query-params.dto';
import { StationOutputDTO } from '../dto/io/station-io.dto';
import { HttpResponse } from '../../../common/types';
import { RouteTypeGuard } from 'src/common/decorators';
import { RouteTypeEnum } from 'src/common/enums';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiOkResponse,
} from '@nestjs/swagger';

@Controller()
@ApiTags('Estações')
@ApiBearerAuth('access')
export class FindManyStationsController {
  constructor(private readonly listStationsService: FindManyStationsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @RouteTypeGuard(RouteTypeEnum.APP)
  @ApiOperation({
    summary: 'Rota que permite buscar os lugares (estações) próximos',
  })
  @ApiOkResponse({
    type: [StationOutputDTO],
    description: 'Lista de estações retornada com sucesso',
  })
  @ApiQuery({ type: FindManyStationsQueryParamsDTO, required: false })
  async handle(
    @Query() query: FindManyStationsQueryParamsDTO,
  ): Promise<HttpResponse<StationOutputDTO[]>> {
    const data = await this.listStationsService.execute(query);
    return { data };
  }
}
