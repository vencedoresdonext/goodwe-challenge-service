import { Controller, Get, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { FindStationDetailWebService } from '../services/find-station-detail-web.service';
import { StationOutputDTO } from '../dto/io/station-io.dto';
import { StationIdParamDTO } from '../dto/params/station-id.param';
import { HttpResponse } from '../../../common/types';
import { RouteTypeGuard } from '../../../common/decorators';
import { RouteTypeEnum } from '../../../common/enums';

@Controller()
export class FindStationWebController {
  constructor(
    private readonly findStationDetailWebService: FindStationDetailWebService,
  ) {}

  @Get('web/:id')
  @HttpCode(HttpStatus.OK)
  @RouteTypeGuard(RouteTypeEnum.WEB)
  async handle(
    @CurrentUser('sub') userId: string,
    @Param() params: StationIdParamDTO,
  ): Promise<HttpResponse<StationOutputDTO>> {
    const data = await this.findStationDetailWebService.execute(
      params.id,
      userId,
    );
    return { data };
  }
}
