import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { RouteTypeGuard } from '../../../common/decorators';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RouteTypeEnum } from '../../../common/enums';
import { HttpResponse } from '../../../common/types';
import { StationOutputDTO } from '../dto/io/station-io.dto';
import { CreateStationInputDTO } from '../dto/io/create-station.dto';
import { CreateStationWebService } from '../services/create-station-web.service';

@Controller()
@ApiTags('Lugares')
@ApiBearerAuth('access')
export class CreateStationWebController {
  constructor(
    private readonly createStationWebService: CreateStationWebService,
  ) {}

  @Post('web')
  @HttpCode(HttpStatus.CREATED)
  @RouteTypeGuard(RouteTypeEnum.WEB)
  @ApiOperation({
    summary:
      'Rota que permite cadastrar uma nova estação, já vinculada a um carregador do usuário logado',
  })
  @ApiCreatedResponse({
    type: StationOutputDTO,
    description: 'Estação criada com sucesso',
  })
  async handle(
    @CurrentUser('sub') userId: string,
    @Body() body: CreateStationInputDTO,
  ): Promise<HttpResponse<StationOutputDTO>> {
    const data = await this.createStationWebService.execute(userId, body);
    return { data };
  }
}
