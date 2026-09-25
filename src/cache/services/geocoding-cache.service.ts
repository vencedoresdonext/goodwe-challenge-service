import { Injectable } from '@nestjs/common';
import { CacheService } from '../cache.service';
import { CachePrefix, CacheTTL } from '../cache.constants';
import { RedisService } from '../redis.service';
import type { GeocodingResult } from '../../integrations/geocoding/geocoding.port';

@Injectable()
export class GeocodingCacheService extends CacheService<
  string,
  GeocodingResult[]
> {
  protected cacheNamespace = CachePrefix.CONFIG;
  protected cacheKey = CachePrefix.GEOCODING;
  protected ttl = CacheTTL.ONE_DAY * 7;

  constructor(redisService: RedisService) {
    super(redisService);
  }

  protected getKey(address: string): string {
    const normalized = address
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
    return `${this.cacheNamespace}${this.cacheKey}${normalized}`;
  }
}
