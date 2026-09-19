import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { FindManyStationsWebService } from '../services/find-many-stations-web.service';
import { StationOutputDTO } from '../dto/io/station-io.dto';
import { HttpResponse } from '../../../common/types';
import { RouteTypeGuard } from '../../../common/decorators';
import { RouteTypeEnum } from '../../../common/enums';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller()
@ApiTags('Lugares')
@ApiBearerAuth('access')
export class FindManyStationsWebController {
  constructor(
    private readonly findManyStationsWebService: FindManyStationsWebService,
  ) {}

  @Get('web')
  @HttpCode(HttpStatus.OK)
  @RouteTypeGuard(RouteTypeEnum.WEB)
  @ApiOperation({ summary: 'Rota que permite buscar todos os lugares' })
  async handle(
    @CurrentUser('sub') userId: string,
  ): Promise<HttpResponse<StationOutputDTO[]>> {
    const data = await this.findManyStationsWebService.execute(userId);
    return { data };
  }
}
