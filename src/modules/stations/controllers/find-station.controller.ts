import { Controller, Get, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { FindStationDetailService } from '../services/find-station-detail.service';
import { StationOutputDTO } from '../dto/io/station-io.dto';
import { StationIdParamDTO } from '../dto/params/station-id.param';
import { HttpResponse } from '../../../common/types';
import { RouteTypeGuard } from 'src/common/decorators';
import { RouteTypeEnum } from 'src/common/enums';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiOkResponse,
} from '@nestjs/swagger';

@Controller()
@ApiTags('Lugares')
@ApiBearerAuth('access')
export class FindStationController {
  constructor(
    private readonly findStationDetailService: FindStationDetailService,
  ) {}

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @RouteTypeGuard(RouteTypeEnum.APP)
  @ApiOperation({ summary: 'Rota que permite buscar um lugar (estação)' })
  @ApiOkResponse({
    type: StationOutputDTO,
    description: 'Estação retornada com sucesso',
  })
  @ApiParam({ name: 'id', type: String })
  async handle(
    @Param() params: StationIdParamDTO,
  ): Promise<HttpResponse<StationOutputDTO>> {
    const data = await this.findStationDetailService.execute(params.id);
    return { data };
  }
}
