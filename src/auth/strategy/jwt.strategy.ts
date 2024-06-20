import { Injectable, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Redis } from 'ioredis';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any): Promise<any> {
    await this.redis.set(`online:${payload.user.id}`, 'true', 'EX', 6000);
    const getListOnline = await this.redis.keys('online:*');
    return {
      ...payload,
    };
  }
}
