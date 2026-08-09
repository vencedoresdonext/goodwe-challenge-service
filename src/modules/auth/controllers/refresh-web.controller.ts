import { Controller, Post, Body } from '@nestjs/common';
import { RefreshService } from '../services/refresh.service';
import { RefreshRequestDTO } from '../dto/request/refresh-request.dto';
import { RefreshOutputDTO } from '../dto/io/refresh-io.dto';
import { RouteTypeEnum } from '../../../common/enums/route-type.enum';
import { RouteTypeGuard } from '../../../common/decorators';
import { HttpResponse } from '../../../common/types';

@Controller()
export class RefreshWebController {
  constructor(private readonly refreshService: RefreshService) {}

  @Post('web/refresh')
  @RouteTypeGuard(RouteTypeEnum.WEB)
  async handle(
    @Body() input: RefreshRequestDTO,
  ): Promise<HttpResponse<RefreshOutputDTO>> {
    const data = await this.refreshService.execute({
      ...input,
      routeType: RouteTypeEnum.WEB,
    });

    return { data };
  }
}
