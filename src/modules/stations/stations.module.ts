import { Module } from '@nestjs/common';
import { FindManyStationsController } from './controllers/find-many-stations.controller';
import { FindStationController } from './controllers/find-station.controller';
import { FindManyStationsWebController } from './controllers/find-many-stations-web.controller';
import { FindStationWebController } from './controllers/find-station-web.controller';
import { FindManyStationsService } from './services/find-many-stations.service';
import { FindStationDetailService } from './services/find-station-detail.service';
import { FindManyStationsWebService } from './services/find-many-stations-web.service';
import { FindStationDetailWebService } from './services/find-station-detail-web.service';
import { LinkCardToChargerWebController } from './controllers/link-card-charger-web.controller';
import { LinkCardToChargerWebService } from './services/link-card-charger-web.service';

@Module({
  controllers: [
    FindManyStationsController,
    FindStationController,
    FindManyStationsWebController,
    FindStationWebController,
    LinkCardToChargerWebController,
  ],
  providers: [
    FindManyStationsService,
    FindStationDetailService,
    FindManyStationsWebService,
    FindStationDetailWebService,
    LinkCardToChargerWebService,
  ],
})
export class StationsModule {}
