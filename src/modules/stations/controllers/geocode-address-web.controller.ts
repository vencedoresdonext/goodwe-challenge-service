import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { RouteTypeGuard } from '../../../common/decorators';
import { RouteTypeEnum } from '../../../common/enums';
import { HttpResponse } from '../../../common/types';
import { GeocodeResultOutputDTO } from '../dto/io/geocode-result-io.dto';
import { GeocodeAddressQueryParamsDTO } from '../dto/query-params/geocode-address-query-params.dto';
import { GeocodeAddressWebService } from '../services/geocode-address-web.service';

@Controller()
@ApiTags('Lugares')
@ApiBearerAuth('access')
export class GeocodeAddressWebController {
  constructor(
    private readonly geocodeAddressWebService: GeocodeAddressWebService,
  ) {}

  @Get('web/geocode')
  @HttpCode(HttpStatus.OK)
  @RouteTypeGuard(RouteTypeEnum.WEB)
  @ApiOperation({
    summary:
      'Busca latitude/longitude de um endereço. Pode devolver vários resultados parecidos para o usuário escolher.',
  })
  @ApiOkResponse({ type: [GeocodeResultOutputDTO] })
  async handle(
    @Query() query: GeocodeAddressQueryParamsDTO,
  ): Promise<HttpResponse<GeocodeResultOutputDTO[]>> {
    const data = await this.geocodeAddressWebService.execute(query.address);
    return { data };
  }
}
