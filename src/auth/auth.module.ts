import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy, RTStrategy, AzureADStrategy } from './strategy';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RTStrategy, AzureADStrategy],
  imports: [
    JwtModule.register({}),
    ConfigModule.forRoot(),
    PassportModule,
    RedisModule,
  ],
})
export class AuthModule {}
