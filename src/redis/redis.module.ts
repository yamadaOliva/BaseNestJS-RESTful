import { Module, Global } from '@nestjs/common';
import { Redis } from 'ioredis';

const redisProvider = {
  provide: 'REDIS_CLIENT',
  useFactory: () => {
    const redis = new Redis({
      host: 'localhost', // Hoặc thông số kết nối Redis của bạn
      port: 6379,
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
