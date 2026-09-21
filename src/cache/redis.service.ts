import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import IoRedisClient from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
  private client: IoRedisClient;
  private readonly logger = new Logger(RedisService.name);

  constructor(private readonly configService: ConfigService) {
    this.client = new IoRedisClient({
      host: this.configService.get<string>('redis.host', '0.0.0.0'),
      port: this.configService.get<number>('redis.port', 6379),
      password: this.configService.get<string>('redis.password'),
      db: this.configService.get<number>('redis.db', 0),
      ...(this.configService.get<boolean>('redis.tls') ? { tls: {} } : {}),
      enableOfflineQueue: false,
      retryStrategy(times) {
        if (times >= 20) return null;
        return Math.min(times * 100, 2000);
      },
    });
  }

  public onModuleInit() {
    this.client.on('error', (error: Error) => {
      this.logger.error(error, `Redis error: ${error.message}`);
    });

    this.client.on('connect', () => {
      this.logger.log('Redis connected.');
    });

    this.client.on('reconnecting', () => {
      this.logger.warn('Redis trying to reconnect.');
    });

    this.client.on('ready', () => this.logger.log('Redis is ready.'));
    this.client.on('end', () => this.logger.warn('Redis client was ended.'));
  }

  public get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  public mget(keys: string[]): Promise<(string | null)[]> {
    return this.client.mget(keys);
  }

  public set(
    key: string,
    value: string | number,
    options?: { ttl: number },
  ): Promise<string> {
    if (options?.ttl) {
      return this.client.set(key, value, 'EX', options.ttl);
    } else {
      return this.client.set(key, value);
    }
  }

  // command mset dont accept ttl argument
  public mset(
    input: { key: string; value: string | number }[],
    options: { ttl?: number },
  ) {
    if (options?.ttl) {
      const ttl = options.ttl;
      const pipeline = this.client.pipeline();
      input.forEach(({ key, value }) => {
        pipeline.set(key, value, 'EX', ttl);
      });

      return pipeline.exec();
    }

    const keyValuePairs: (string | number)[] = [];
    input.forEach((item) => {
      keyValuePairs.push(item.key, item.value);
    });

    return this.client.mset(keyValuePairs);
  }

  public async deleteKeysWithPrefix(prefix: string): Promise<void> {
    let cursor = '0';

    do {
      const [nextCursor, keys] = await this.client.scan(
        cursor,
        'MATCH',
        `${prefix}*`,
      );
      cursor = nextCursor;

      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } while (cursor !== '0');
  }

  public delete(key: string): Promise<number> {
    return this.client.del(key);
  }

  public getClient(): IoRedisClient {
    return this.client;
  }

  // =============
  // Set operations
  // =============

  public async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);

    return result === 1;
  }

  public getSet(key: string): Promise<string[]> {
    return this.client.smembers(key);
  }

  public async getSetMember(key: string, member: string): Promise<boolean> {
    const result = await this.client.sismember(key, member);

    return result === 1;
  }

  public async setSet(
    key: string,
    members: Array<string | number>,
    options?: { ttl?: number },
  ): Promise<void> {
    const multi = this.client.multi();
    multi.del(key);
    if (members.length > 0) {
      const parsedMembers = members.map((m) => String(m));
      multi.sadd(key, ...parsedMembers);
    }
    if (options?.ttl) {
      multi.expire(key, options.ttl);
    }
    await multi.exec();
  }

  public addToSet(
    key: string,
    members: Array<string | number>,
  ): Promise<number> {
    const parsedMembers = members.map((m) => String(m));

    return this.client.sadd(key, ...parsedMembers);
  }

  public removeFromSet(
    key: string,
    members: Array<string | number>,
  ): Promise<number> {
    const parsedMembers = members.map((m) => String(m));

    return this.client.srem(key, ...parsedMembers);
  }

  public expire(key: string, ttlSeconds: number): Promise<number> {
    return this.client.expire(key, ttlSeconds);
  }

  // =============
  // Pub/Sub operations
  // =============

  public publish(channel: string, message: string): Promise<number> {
    return this.client.publish(channel, message);
  }

  public createSubscriber(): IoRedisClient {
    return new IoRedisClient({
      host: this.configService.get<string>('redis.host', 'localhost'),
      port: this.configService.get<number>('redis.port', 6379),
      password: this.configService.get<string>('redis.password'),
      db: this.configService.get<number>('redis.db', 0),
      ...(this.configService.get<boolean>('redis.tls') ? { tls: {} } : {}),
      enableOfflineQueue: true,
      retryStrategy(times) {
        if (times >= 20) {
          return null;
        }
        return Math.min(times * 100, 2000);
      },
    });
  }
}
