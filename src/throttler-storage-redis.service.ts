import { Injectable } from '@nestjs/common';
import Redis, { Cluster, RedisOptions } from 'ioredis';
import { ThrottlerStorageRedis } from './throttler-storage-redis.interface';

type RedisClient = Redis | Cluster;

@Injectable()
export class ThrottlerStorageRedisService implements ThrottlerStorageRedis {
  public redis: RedisClient;
  public scanCount: number;

  public constructor(redis?: RedisClient, scanCount?: number);
  public constructor(options?: RedisOptions, scanCount?: number);
  public constructor(url?: string, scanCount?: number);
  public constructor(redisOrOptions?: RedisClient | RedisOptions | string, scanCount?: number) {
    this.scanCount = scanCount ?? 1000;

    if (redisOrOptions instanceof Redis || redisOrOptions instanceof Cluster) {
      this.redis = redisOrOptions;
    } else if (typeof redisOrOptions === 'string') {
      this.redis = new Redis(redisOrOptions);
    } else {
      this.redis = new Redis(redisOrOptions);
    }
  }

  private get keyPrefix() {
    if (this.redis instanceof Redis.Cluster) {
      return this.redis.options.redisOptions?.keyPrefix ?? '';
    } else if (this.redis instanceof Redis) {
      return this.redis.options.keyPrefix ?? '';
    }

    return '';
  }

  public async getRecord(key: string): Promise<number[]> {
    const ttls = (
      await this.redis.scan(0, 'MATCH', `${this.keyPrefix}${key}:*`, 'COUNT', this.scanCount)
    ).pop();
    return (ttls as string[]).map((k) => Number(k.split(':').pop())).sort();
  }

  public async addRecord(key: string, ttl: number): Promise<void> {
    await this.redis.set(`${key}:${Date.now() + ttl * 1000}`, ttl, 'EX', ttl);
  }
}
