import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ChargerSessionRepository } from '../../../database/repositories';
import { ChargingTelemetryPort } from '../../../integrations/http/charging-telemetry/charging-telemetry.port';
import { ChargerSessionStatusEnum } from '../../../common/enums';

@Injectable()
export class IdleSessionCronService {
  private readonly logger = new Logger(IdleSessionCronService.name);

  constructor(
    private readonly chargerSessionRepository: ChargerSessionRepository,
    private readonly telemetryPort: ChargingTelemetryPort,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    this.logger.debug('Running IdleSessionCronService...');

    const activeSessions = await this.chargerSessionRepository.findManyByStatus(
      ChargerSessionStatusEnum.CHARGING,
    );

    const chunkSize = 20;
    for (let i = 0; i < activeSessions.length; i += chunkSize) {
      const chunk = activeSessions.slice(i, i + chunkSize);

      await Promise.all(
        chunk.map(async (session) => {
          try {
            const telemetry = await this.telemetryPort.getChargingTelemetry(
              session.id,
            );
            if (!telemetry) return;

            let idleStartedAt = session.idleStartedAt;

            if (telemetry.batteryPercentage === 100) {
              if (!idleStartedAt) {
                idleStartedAt = new Date();
                this.logger.log(
                  `Session ${session.id} reached 100% battery. Starting idle timer.`,
                );
                await this.chargerSessionRepository.updateIdleData(session.id, {
                  idleStartedAt,
                  lastBatteryPercentage: 100,
                });
              } else {
                const idleMinutes =
                  (new Date().getTime() - idleStartedAt.getTime()) /
                  (1000 * 60);

                if (idleMinutes > 10) {
                  this.logger.warn(
                    `Session ${session.id} has been idle for more than 10 minutes. Applying penalty/finishing session.`,
                  );
                  await this.chargerSessionRepository.updateStatus(
                    session.id,
                    ChargerSessionStatusEnum.COMPLETED,
                  );
                }
              }
            } else {
              if (
                session.lastBatteryPercentage !== telemetry.batteryPercentage
              ) {
                await this.chargerSessionRepository.updateIdleData(session.id, {
                  lastBatteryPercentage: telemetry.batteryPercentage,
                });
              }
            }
          } catch (error) {
            this.logger.error(
              `Error processing telemetry for session ${session.id}`,
              error,
            );
          }
        }),
      );
    }
  }
}
