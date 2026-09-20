import {
  Controller,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { DeleteVehicleService } from '../services/delete-vehicle.service';
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
export class DeleteVehicleController {
  constructor(private readonly deleteVehicleService: DeleteVehicleService) {}

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RouteTypeGuard(RouteTypeEnum.APP)
  @ApiOperation({ summary: 'Rota que permite excluir um veículo' })
  @ApiNoContentResponse({ description: 'Veículo excluído com sucesso' })
  @ApiParam({ name: 'id', type: String })
  async handle(
    @CurrentUser('sub') userId: string,
    @Param('id') vehicleId: string,
  ): Promise<void> {
    await this.deleteVehicleService.execute(userId, vehicleId);
  }
}
