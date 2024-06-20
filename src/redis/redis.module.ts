import { Module, Global } from '@nestjs/common';
import { Redis } from 'ioredis';
import * as dotenv from 'dotenv';
const redisProvider = {
  provide: 'REDIS_CLIENT',
  useFactory: () => {
    const redis = new Redis({
      host:  process.env.REDIS_BASE || 'localhost',
      port: parseInt(process.env.REDIS_HOST)  || 6379,
    });
    return redis;
  },
};

@Global()
@Module({
  providers: [redisProvider],
  exports: [redisProvider],
})
export class RedisModule {}
