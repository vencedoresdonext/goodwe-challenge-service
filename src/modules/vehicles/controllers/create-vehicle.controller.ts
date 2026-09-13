import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CreateVehicleService } from '../services/create-vehicle.service';
import { CreateVehicleRequestDTO } from '../dto/request/create-vehicle-request.dto';
import { VehicleOutputDTO } from '../dto/io/vehicle-io.dto';
import { HttpResponse } from '../../../common/types';
import { RouteTypeGuard } from '../../../common/decorators/route-type.decorator';
import { RouteTypeEnum } from '../../../common/enums';

@Controller()
export class CreateVehicleController {
  constructor(private readonly createVehicleService: CreateVehicleService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RouteTypeGuard(RouteTypeEnum.APP)
  async handle(
    @CurrentUser('sub') userId: string,
    @Body() input: CreateVehicleRequestDTO,
  ): Promise<HttpResponse<VehicleOutputDTO>> {
    const data = await this.createVehicleService.execute(userId, input);
    return { data };
  }
}
