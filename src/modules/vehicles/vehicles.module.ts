import { Module } from '@nestjs/common';
import { CreateVehicleController } from './controllers/create-vehicle.controller';
import { FindManyVehiclesController } from './controllers/find-many-vehicles.controller';
import { SetActiveVehicleController } from './controllers/set-active-vehicle.controller';
import { DeleteVehicleController } from './controllers/delete-vehicle.controller';

import { CreateVehicleService } from './services/create-vehicle.service';
import { FindManyVehiclesService } from './services/find-many-vehicles.service';
import { SetActiveVehicleService } from './services/set-active-vehicle.service';
import { DeleteVehicleService } from './services/delete-vehicle.service';

@Module({
  controllers: [
    CreateVehicleController,
    FindManyVehiclesController,
    SetActiveVehicleController,
    DeleteVehicleController,
  ],
  providers: [
    CreateVehicleService,
    FindManyVehiclesService,
    SetActiveVehicleService,
    DeleteVehicleService,
  ],
})
export class VehiclesModule {}
