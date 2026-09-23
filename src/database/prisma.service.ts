import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

const MAX_CONNECT_ATTEMPTS = 5;
const RETRY_DELAY_MS = 2_000;

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(config: ConfigService) {
    const isProduction =
      (config.get<string>('app.nodeEnv') ?? process.env.NODE_ENV) ===
      'production';
    const datasourceUrl =
      config.get<string>('database.url') ?? process.env.DATABASE_URL;

    super({
      datasourceUrl,
      errorFormat: isProduction ? 'minimal' : 'pretty',
      log: isProduction ? ['warn', 'error'] : ['info', 'warn', 'error'],
    });
  }

  async onModuleInit(): Promise<void> {
    for (let attempt = 1; ; attempt++) {
      try {
        await this.$connect();
        this.logger.log('Prisma connected to database');
        return;
      } catch (error) {
        if (attempt >= MAX_CONNECT_ATTEMPTS) throw error;
        this.logger.warn(
          `Error to connect database (try ${attempt}/${MAX_CONNECT_ATTEMPTS}). New try in ${RETRY_DELAY_MS / 1000}s...`,
        );
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      }
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Prisma disconnected from database');
  }
}
