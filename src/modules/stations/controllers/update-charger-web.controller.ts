import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { RouteTypeGuard } from '../../../common/decorators';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RouteTypeEnum } from '../../../common/enums';
import { HttpResponse } from '../../../common/types';
import { ConnectorOutputDTO } from '../dto/io/station-io.dto';
import { ChargerIdParamDTO } from '../dto/params/charger-id.param';
import { UpdateChargerRequestDTO } from '../dto/request/update-charger-request.dto';
import { UpdateChargerWebService } from '../services/update-charger-web.service';

@Controller()
@ApiTags('Estações')
@ApiBearerAuth('access')
export class UpdateChargerWebController {
  constructor(
    private readonly updateChargerWebService: UpdateChargerWebService,
  ) {}

  @Patch('web/chargers/:id')
  @HttpCode(HttpStatus.OK)
  @RouteTypeGuard(RouteTypeEnum.WEB)
  @ApiOperation({
    summary: 'Edita um carregador (tipo, potência, preço e status manual)',
  })
  @ApiParam({ name: 'id', type: String, description: 'ID do carregador' })
  @ApiOkResponse({ type: ConnectorOutputDTO })
  async handle(
    @CurrentUser('sub') userId: string,
    @Param() params: ChargerIdParamDTO,
    @Body() body: UpdateChargerRequestDTO,
  ): Promise<HttpResponse<ConnectorOutputDTO>> {
    const data = await this.updateChargerWebService.execute(
      userId,
      params.id,
      body,
    );
    return { data };
  }
}
