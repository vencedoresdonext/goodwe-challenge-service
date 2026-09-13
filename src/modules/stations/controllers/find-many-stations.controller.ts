import { Controller, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { FindManyStationsService } from '../services/find-many-stations.service';
import { FindManyStationsQueryParamsDTO } from '../dto/query-params/find-many-stations-query-params.dto';
import { StationOutputDTO } from '../dto/io/station-io.dto';
import { HttpResponse } from '../../../common/types';
import { RouteTypeGuard } from 'src/common/decorators';
import { RouteTypeEnum } from 'src/common/enums';

@Controller()
export class FindManyStationsController {
  constructor(private readonly listStationsService: FindManyStationsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @RouteTypeGuard(RouteTypeEnum.APP)
  async handle(
    @Query() query: FindManyStationsQueryParamsDTO,
  ): Promise<HttpResponse<StationOutputDTO[]>> {
    const data = await this.listStationsService.execute(query);
    return { data };
  }
}
