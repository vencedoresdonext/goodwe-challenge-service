import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { RouteTypeGuard } from '../../../common/decorators';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RouteTypeEnum } from '../../../common/enums';
import { HttpResponse } from '../../../common/types';
import { EnergyDashboardOutputDTO } from '../dto/io/energy-dashboard-io.dto';
import { EnergyDashboardQueryParamsDTO } from '../dto/query-params/energy-dashboard-query-params.dto';
import { FindEnergyDashboardWebService } from '../services/find-energy-dashboard-web.service';

@Controller()
@ApiTags('Lugares')
@ApiBearerAuth('access')
export class FindEnergyDashboardWebController {
  constructor(
    private readonly findEnergyDashboardWebService: FindEnergyDashboardWebService,
  ) {}

  @Get('web/dashboard/energy')
  @HttpCode(HttpStatus.OK)
  @RouteTypeGuard(RouteTypeEnum.WEB)
  @ApiOperation({
    summary:
      'Curva de potência (kW) e energia (kWh) dos carregadores do usuário, por station ou por carregador',
  })
  @ApiOkResponse({ type: EnergyDashboardOutputDTO })
  async handle(
    @CurrentUser('sub') userId: string,
    @Query() query: EnergyDashboardQueryParamsDTO,
  ): Promise<HttpResponse<EnergyDashboardOutputDTO>> {
    const data = await this.findEnergyDashboardWebService.execute(
      userId,
      query,
    );
    return { data };
  }
}
