import {
  Controller,
  Patch,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { LinkCardToChargerWebService } from '../services/link-card-charger-web.service';
import { LinkCardChargerRequestDTO } from '../dto/request/link-card-charger-request.dto';
import { LinkCardChargerParamsDTO } from '../dto/params/link-card-charger-params.dto';
import { HttpResponse } from '../../../common/types';
import { RouteTypeGuard } from '../../../common/decorators';
import { RouteTypeEnum } from '../../../common/enums';
import { ChargerDTO } from '../../../database/repositories/charger/dto/charger.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

@Controller()
@ApiTags('Estações')
@ApiBearerAuth('access')
export class LinkCardToChargerWebController {
  constructor(
    private readonly linkCardToChargerWebService: LinkCardToChargerWebService,
  ) {}

  @Patch('web/stations/chargers/:id/card')
  @HttpCode(HttpStatus.OK)
  @RouteTypeGuard(RouteTypeEnum.WEB)
  @ApiOperation({
    summary: 'Rota que permite vincular um cartão a um carregador',
  })
  @ApiParam({ name: 'id', type: LinkCardChargerParamsDTO })
  @ApiBody({ type: LinkCardChargerRequestDTO })
  async handle(
    @CurrentUser('sub') userId: string,
    @Param() params: LinkCardChargerParamsDTO,
    @Body() input: LinkCardChargerRequestDTO,
  ): Promise<HttpResponse<ChargerDTO>> {
    const data = await this.linkCardToChargerWebService.execute(
      userId,
      params.id,
      input.cardId,
    );
    return { data };
  }
}
