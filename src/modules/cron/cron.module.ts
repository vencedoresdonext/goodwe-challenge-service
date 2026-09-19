import { Module } from '@nestjs/common';
import { IdleSessionCronService } from './services/idle-session-cron.service';
import { DatabaseModule } from 'src/database/database.module';
import { IntegrationsModule } from 'src/integrations/integrations.module';

@Module({
  imports: [DatabaseModule, IntegrationsModule],
  providers: [IdleSessionCronService],
})
export class CronModule {}
