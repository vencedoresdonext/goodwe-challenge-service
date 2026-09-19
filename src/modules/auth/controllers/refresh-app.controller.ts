import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { RefreshService } from '../services/refresh.service';
import { RefreshRequestDTO } from '../dto/request/refresh-request.dto';
import { RefreshOutputDTO } from '../dto/io/refresh-io.dto';
import { RouteTypeEnum } from '../../../common/enums/route-type.enum';
import { RouteTypeGuard } from '../../../common/decorators';
import { HttpResponse } from '../../../common/types';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller()
@ApiTags('Auth')
export class RefreshAppController {
  constructor(private readonly refreshService: RefreshService) {}

  @RouteTypeGuard(RouteTypeEnum.APP)
  @HttpCode(HttpStatus.OK)
  @Post('app/refresh')
  @ApiOperation({ summary: 'Rota que permite atualizar o token no APP' })
  @ApiBody({ type: RefreshRequestDTO })
  async handle(
    @Body() input: RefreshRequestDTO,
  ): Promise<HttpResponse<RefreshOutputDTO>> {
    const data = await this.refreshService.execute({
      ...input,
      routeType: RouteTypeEnum.APP,
    });

    return { data };
  }
}
