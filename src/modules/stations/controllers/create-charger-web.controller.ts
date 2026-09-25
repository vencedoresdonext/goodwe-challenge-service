import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { RouteTypeGuard } from '../../../common/decorators';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RouteTypeEnum } from '../../../common/enums';
import { HttpResponse } from '../../../common/types';
import { ConnectorOutputDTO } from '../dto/io/station-io.dto';
import { StationIdParamDTO } from '../dto/params/station-id.param';
import { CreateChargerRequestDTO } from '../dto/request/create-charger-request.dto';
import { CreateChargerWebService } from '../services/create-charger-web.service';

@Controller()
@ApiTags('Estações')
@ApiBearerAuth('access')
export class CreateChargerWebController {
  constructor(
    private readonly createChargerWebService: CreateChargerWebService,
  ) {}

  @Post('web/:id/chargers')
  @HttpCode(HttpStatus.CREATED)
  @RouteTypeGuard(RouteTypeEnum.WEB)
  @ApiOperation({ summary: 'Adiciona um novo carregador a uma station' })
  @ApiParam({ name: 'id', type: String, description: 'ID da station' })
  @ApiCreatedResponse({ type: ConnectorOutputDTO })
  async handle(
    @CurrentUser('sub') userId: string,
    @Param() params: StationIdParamDTO,
    @Body() body: CreateChargerRequestDTO,
  ): Promise<HttpResponse<ConnectorOutputDTO>> {
    const data = await this.createChargerWebService.execute(
      userId,
      params.id,
      body,
    );
    return { data };
  }
}
