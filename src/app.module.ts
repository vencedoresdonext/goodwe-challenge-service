import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  APP_FILTER,
  APP_GUARD,
  APP_INTERCEPTOR,
  RouterModule,
} from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import Redis from 'ioredis';
import { JwtModule } from '@nestjs/jwt';
import { LoggerModule } from 'nestjs-pino';
import { ScheduleModule } from '@nestjs/schedule';

import {
  appConfig,
  databaseConfig,
  redisConfig,
  throttlerConfig,
  jwtConfig,
  telemetryConfig,
  validate,
} from './config';
import { paymentGatewayConfig } from './config/payment-gateway.config';

import { DatabaseModule } from './database/database.module';
import { RedisCacheModule } from './cache/cache.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { HealthModule } from './health/health.module';

import { AllExceptionsFilter } from './common/filters';
import { AuthGuard } from './common/guards/auth.guard';
import {
  LoggingInterceptor,
  TimeoutInterceptor,
  TransformInterceptor,
} from './common/interceptors';
import { CorrelationIdMiddleware } from './common/middlewares';

import { AuthModule } from './modules/auth/auth.module';
import { PaymentModule } from './modules/payment/payment.module';
import { UsersModule } from './modules/users/users.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { StationsModule } from './modules/stations/stations.module';
import { ChargingSessionsModule } from './modules/charging-sessions/charging-sessions.module';
import { CronModule } from './modules/cron/cron.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        databaseConfig,
        redisConfig,
        throttlerConfig,
        jwtConfig,
        paymentGatewayConfig,
        telemetryConfig,
      ],
      validate,
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isServerless = !!process.env.VERCEL;
        const isProd =
          isServerless ||
          process.env.NODE_ENV === 'production' ||
          configService.get<string>('app.nodeEnv') === 'production';

        return {
          pinoHttp: {
            level: configService.get<string>('LOG_LEVEL', 'info'),
            transport: isProd
              ? undefined
              : {
                  target: 'pino-pretty',
                  options: {
                    colorize: true,
                    singleLine: true,
                    translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l',
                  },
                },
          },
        };
      },
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      global: true,
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get('jwt.expiresIn', '15m'),
        },
      }),
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            name: 'short',
            ttl: configService.get<number>('throttler.short.ttl', 1000),
            limit: configService.get<number>('throttler.short.limit', 30),
          },
          {
            name: 'medium',
            ttl: configService.get<number>('throttler.medium.ttl', 10000),
            limit: configService.get<number>('throttler.medium.limit', 150),
          },
          {
            name: 'long',
            ttl: configService.get<number>('throttler.long.ttl', 60000),
            limit: configService.get<number>('throttler.long.limit', 600),
          },
        ],
        storage: new ThrottlerStorageRedisService(
          new Redis({
            host: configService.get<string>('redis.host', 'localhost'),
            port: configService.get<number>('redis.port', 6379),
            password: configService.get<string>('redis.password') || undefined,
            db: configService.get<number>('redis.db', 0),
          }),
        ),
      }),
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    RedisCacheModule,
    IntegrationsModule,
    HealthModule,
    AuthModule,
    PaymentModule,
    UsersModule,
    VehiclesModule,
    StationsModule,
    ChargingSessionsModule,
    CronModule,
    RouterModule.register([
      { path: '/auth', module: AuthModule },
      { path: '/payment', module: PaymentModule },
      { path: '/users', module: UsersModule },
      { path: '/vehicles', module: VehiclesModule },
      { path: '/stations', module: StationsModule },
      { path: '/charging-session', module: ChargingSessionsModule }, // Routes already mapped as /charging-sessions
    ]),
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TimeoutInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
