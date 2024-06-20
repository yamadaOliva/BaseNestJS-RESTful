import { Module, Global } from '@nestjs/common';
import { Redis } from 'ioredis';
import * as dotenv from 'dotenv';
dotenv.config();
console.log('hehe', process.env.REDIS_BASE, parseInt(process.env.REDIS_HOST), process.env.REDIS_URL , process.env.DATABASE_URL, "lelelelel");
const redisProvider = {
  provide: 'REDIS_CLIENT',
  useFactory: () => {
    const redisUrl = process.env.REDIS_URL || null;
    const redis = redisUrl
      ? new Redis(redisUrl)
      : new Redis({
          host: process.env.REDIS_BASE || 'localhost',
          port: parseInt(process.env.REDIS_HOST) || 6379,
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
