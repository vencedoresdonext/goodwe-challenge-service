import { Module } from '@nestjs/common';
import { StartSessionController } from './controllers/start-session.controller';
import { FindSessionStatusController } from './controllers/find-session-status.controller';
import { StopSessionController } from './controllers/stop-session.controller';
import { StartSessionService } from './services/start-session.service';
import { FindSessionStatusService } from './services/find-session-status.service';
import { StopSessionService } from './services/stop-session.service';
import { IntegrationsModule } from '../../integrations/integrations.module';

@Module({
  imports: [IntegrationsModule],
  controllers: [
    StartSessionController,
    FindSessionStatusController,
    StopSessionController,
  ],
  providers: [
    StartSessionService,
    FindSessionStatusService,
    StopSessionService,
  ],
})
export class ChargingSessionsModule {}
