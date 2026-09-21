import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';
import { RedisService } from './redis.service';
import { RateLimitCacheService } from './services/rate-limit-cache.service';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const tls = configService.get<boolean>('redis.tls');

        return {
          store: await redisStore({
            socket: {
              host: configService.get<string>('redis.host'),
              port: configService.get<number>('redis.port'),
              ...(tls ? { tls: true as const } : {}),
            },
            password: configService.get<string>('redis.password'),
            database: configService.get<number>('redis.db'),
          }),
        };
      },
    }),
  ],
  providers: [RedisService, RateLimitCacheService],
  exports: [RedisService, NestCacheModule, RateLimitCacheService],
})
export class RedisCacheModule {}
