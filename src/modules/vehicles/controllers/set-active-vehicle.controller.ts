import { Controller, Patch, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { SetActiveVehicleService } from '../services/set-active-vehicle.service';
import { VehicleIdParamDTO } from '../dto/params/vehicle-id.param';
import { RouteTypeGuard } from '../../../common/decorators/route-type.decorator';
import { RouteTypeEnum } from '../../../common/enums';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiNoContentResponse,
} from '@nestjs/swagger';

@Controller()
@ApiTags('Veículos')
@ApiBearerAuth('access')
export class SetActiveVehicleController {
  constructor(
    private readonly setActiveVehicleService: SetActiveVehicleService,
  ) {}

  @Patch(':id/activate')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RouteTypeGuard(RouteTypeEnum.APP)
  @ApiOperation({ summary: 'Rota que permite ativar um veículo' })
  @ApiNoContentResponse({ description: 'Veículo ativado com sucesso' })
  @ApiParam({ name: 'id', type: String })
  async handle(
    @CurrentUser('sub') userId: string,
    @Param() params: VehicleIdParamDTO,
  ): Promise<void> {
    await this.setActiveVehicleService.execute(userId, params.id);
  }
}
