import { Injectable } from '@nestjs/common';
import { CacheService } from '../cache.service';
import { CachePrefix, CacheTTL } from '../cache.constants';
import { RedisService } from '../redis.service';

export interface RateLimitData {
  attempts: number;
  blockCount: number;
  blockedUntil: number; // timestamp em ms (0 se não bloqueado)
}

@Injectable()
export class RateLimitCacheService extends CacheService<string, RateLimitData> {
  protected cacheNamespace = CachePrefix.RATE_LIMIT;
  protected cacheKey = '';
  protected ttl = CacheTTL.ONE_DAY * 7; // Mantém histórico de bloqueio por até 7 dias

  constructor(redisService: RedisService) {
    super(redisService);
  }

  protected getKey(document: string): string {
    return `${this.cacheNamespace}${this.cacheKey}${document}`;
  }
}
