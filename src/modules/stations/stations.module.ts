import { Module } from '@nestjs/common';
import { FindManyStationsController } from './controllers/find-many-stations.controller';
import { FindStationController } from './controllers/find-station.controller';
import { FindManyStationsService } from './services/find-many-stations.service';
import { FindStationDetailService } from './services/find-station-detail.service';

@Module({
  controllers: [FindManyStationsController, FindStationController],
  providers: [FindManyStationsService, FindStationDetailService],
})
export class StationsModule {}
