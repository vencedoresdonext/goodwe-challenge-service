import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';
import { safeJsonParse } from '../common/utils/safe-json-parse';

@Injectable()
export abstract class CacheService<K, V> {
  protected abstract cacheNamespace: string;
  protected abstract cacheKey: string;
  protected abstract ttl: number;

  protected abstract getKey(key: K): string;

  protected valueToString(value: V): string {
    return JSON.stringify(value);
  }

  protected stringToValue(value: string): V | null {
    return value ? safeJsonParse(value) : null;
  }

  constructor(private readonly redisService: RedisService) {}

  public async delete(document: K): Promise<void> {
    const key = this.getKey(document);
    await this.redisService.delete(key);
  }

  public async get(document: K): Promise<V | null> {
    const key = this.getKey(document);
    const json = await this.redisService.get(key);

    return json ? this.stringToValue(json) : null;
  }

  public async set(document: K, value: V): Promise<void> {
    const valueString = this.valueToString(value);
    const key = this.getKey(document);

    await this.redisService.set(key, valueString, {
      ttl: this.ttl,
    });
  }

  public async mget(documents: K[]): Promise<(V | null)[]> {
    if (!documents.length) {
      return [];
    }

    const keys = documents.map((document) => this.getKey(document));
    const cache = await this.redisService.mget(keys);

    return cache.map((data: string | null) =>
      data ? this.stringToValue(data) : null,
    );
  }

  public async mset(input: { key: K; value: V }[]): Promise<void> {
    if (!input.length) return;

    const parsedData = input.map(({ key, value }) => ({
      key: this.getKey(key),
      value: this.valueToString(value),
    }));

    await this.redisService.mset(parsedData, { ttl: this.ttl });
  }

  public async clearCache(): Promise<void> {
    await this.redisService.deleteKeysWithPrefix(
      `${this.cacheNamespace}:${this.cacheKey}`,
    );
  }
}
