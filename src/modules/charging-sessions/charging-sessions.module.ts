import { Module } from '@nestjs/common';
import { StartSessionController } from './controllers/start-session.controller';
import { FindSessionStatusController } from './controllers/find-session-status.controller';
import { StopSessionController } from './controllers/stop-session.controller';
import { StartSessionWebController } from './controllers/start-session-web.controller';
import { FindSessionStatusWebController } from './controllers/find-session-status-web.controller';
import { StopSessionWebController } from './controllers/stop-session-web.controller';
import { StartSessionService } from './services/start-session.service';
import { FindSessionStatusService } from './services/find-session-status.service';
import { StopSessionService } from './services/stop-session.service';
import { FindSessionStatusWebService } from './services/find-session-status-web.service';
import { FindManySessionsWebService } from './services/find-many-sessions-web.service';
import { FindManySessionsWebController } from './controllers/find-many-sessions-web.controller';
import { IntegrationsModule } from '../../integrations/integrations.module';

@Module({
  imports: [IntegrationsModule],
  controllers: [
    StartSessionController,
    FindSessionStatusController,
    StopSessionController,
    StartSessionWebController,
    FindSessionStatusWebController,
    StopSessionWebController,
    FindManySessionsWebController,
  ],
  providers: [
    StartSessionService,
    FindSessionStatusService,
    StopSessionService,
    FindSessionStatusWebService,
    FindManySessionsWebService,
  ],
})
export class ChargingSessionsModule {}
