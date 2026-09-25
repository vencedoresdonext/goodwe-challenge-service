import { Module } from '@nestjs/common';
import { IntegrationsModule } from '../../integrations/integrations.module';
import { FindManyStationsController } from './controllers/find-many-stations.controller';
import { FindStationController } from './controllers/find-station.controller';
import { FindManyStationsWebController } from './controllers/find-many-stations-web.controller';
import { FindStationWebController } from './controllers/find-station-web.controller';
import { LinkCardToChargerWebController } from './controllers/link-card-charger-web.controller';
import { CreateStationWebController } from './controllers/create-station-web.controller';
import { GeocodeAddressWebController } from './controllers/geocode-address-web.controller';
import { CreateChargerWebController } from './controllers/create-charger-web.controller';
import { UpdateChargerWebController } from './controllers/update-charger-web.controller';
import { FindEnergyDashboardWebController } from './controllers/find-energy-dashboard-web.controller';
import { FindManyStationsService } from './services/find-many-stations.service';
import { FindStationDetailService } from './services/find-station-detail.service';
import { FindManyStationsWebService } from './services/find-many-stations-web.service';
import { FindStationDetailWebService } from './services/find-station-detail-web.service';
import { LinkCardToChargerWebService } from './services/link-card-charger-web.service';
import { CreateStationWebService } from './services/create-station-web.service';
import { GeocodeAddressWebService } from './services/geocode-address-web.service';
import { CreateChargerWebService } from './services/create-charger-web.service';
import { UpdateChargerWebService } from './services/update-charger-web.service';
import { FindEnergyDashboardWebService } from './services/find-energy-dashboard-web.service';

@Module({
  imports: [IntegrationsModule],
  controllers: [
    GeocodeAddressWebController,
    FindEnergyDashboardWebController,
    FindManyStationsController,
    FindStationController,
    FindManyStationsWebController,
    FindStationWebController,
    LinkCardToChargerWebController,
    CreateStationWebController,
    CreateChargerWebController,
    UpdateChargerWebController,
  ],
  providers: [
    FindManyStationsService,
    FindStationDetailService,
    FindManyStationsWebService,
    FindStationDetailWebService,
    LinkCardToChargerWebService,
    CreateStationWebService,
    GeocodeAddressWebService,
    CreateChargerWebService,
    UpdateChargerWebService,
    FindEnergyDashboardWebService,
  ],
})
export class StationsModule {}
