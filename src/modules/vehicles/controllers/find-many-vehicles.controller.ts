import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { FindManyVehiclesService } from '../services/find-many-vehicles.service';
import { VehicleOutputDTO } from '../dto/io/vehicle-io.dto';
import { HttpResponse } from '../../../common/types';
import { RouteTypeGuard } from '../../../common/decorators/route-type.decorator';
import { RouteTypeEnum } from '../../../common/enums';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiOkResponse,
} from '@nestjs/swagger';

@Controller()
@ApiTags('Veículos')
@ApiBearerAuth('access')
export class FindManyVehiclesController {
  constructor(private readonly listVehiclesService: FindManyVehiclesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @RouteTypeGuard(RouteTypeEnum.APP)
  @ApiOperation({ summary: 'Rota que permite buscar todos os veículos' })
  @ApiOkResponse({
    type: [VehicleOutputDTO],
    description: 'Lista de veículos retornada com sucesso',
  })
  async handle(
    @CurrentUser('sub') userId: string,
  ): Promise<HttpResponse<VehicleOutputDTO[]>> {
    const data = await this.listVehiclesService.execute(userId);
    return { data };
  }
}
