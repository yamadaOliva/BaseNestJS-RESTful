import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDTO } from './dto';
import { ResponseClass } from '../global';
import { HttpStatusCode } from '../global/globalEnum';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { faker } from '@faker-js/faker';
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  doSomething() {
    console.log('Doing something...');
  }
  async register(authDTO: AuthDTO) {
    const hashedPassword = await argon.hash(authDTO.password);
    console.log(authDTO);
    try {
      const user = await this.prisma.user.create({
        data: {
          email: authDTO.email,
          password: hashedPassword,
          name: authDTO.name,
          avatarUrl: faker.image.avatar(),
          studentId: authDTO.studentId,
          majorId: authDTO.majorId,
          comeFrom: authDTO.comeFrom,
          liveIn: authDTO.liveIn,
          Birthday: authDTO.Birthday,
          class: authDTO.class,
          interest: authDTO.interest,
          gender: authDTO.gender,
          schoolYear: authDTO.schoolYear,
        },
      });
      console.log('test', user);
      delete user.password;
      delete user.updatedAt;
      if (user.name === null) delete user.name;
      const token: any = await this.convertToJwt({
        email: user.email,
        id: user.id,
      });
      await this.updateRefreshToken(user.email, token.refresh_token);
      return new ResponseClass(
        token,
        HttpStatusCode.SUCCESS,
        "User's account has been created successfully",
      );
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ForbiddenException("User's email already exists");
      }
    }
  }
  async login(authDTO: AuthDTO) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email: authDTO.email,
        },
      });
      console.log(user);
      if (user) {
        const isPasswordValid = await argon.verify(
          user.password,
          authDTO.password,
        );
        if (isPasswordValid) {
          delete user.password;
          if (user.name === null) delete user.name;
          const token: any = await this.convertToJwt({
            email: user.email,
            id: user.id,
          });
          console.log(token);
          return new ResponseClass(
            token,
            HttpStatusCode.SUCCESS,
            'User logged in successfully',
          );
        }else{
          throw new ForbiddenException("User's email or password is incorrect");
        }
      } else {
        throw new ForbiddenException("User's email or password is incorrect");
      }
    } catch (error) {
      throw new ForbiddenException("User's email or password is incorrect");
    }
  }
  async convertToJwt(user: { email: string , id:string}): Promise<any> {
    const payload = { user };
    return {
      access_token: await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN,
      }),
      refresh_token: await this.jwtService.signAsync(payload, {
        secret: process.env.RT_SECRET,
        expiresIn: process.env.RT_EXPIRES_IN,
      }),
    };
  }

  updateRefreshToken = async (
    email: string,
    refresh_token: string,
  ): Promise<void> => {
    const refreshToken =
      refresh_token || crypto.randomBytes(64).toString('hex');
    try {
      await this.prisma.user.update({
        where: {
          email: email,
        },
        data: {
          refreshToken: refreshToken,
        },
      });
    } catch (error) {
      console.log(error);
    }
  };

  async refreshToken(email: string, refresh_token: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    console.log(user);
    if (!user || !user.refreshToken)
      throw new ForbiddenException(
        "User's email or refresh token is incorrect",
      );
    if (user!.refreshToken !== refresh_token) {
      const token: any = await this.convertToJwt({
        email: user!.email,
        id: user!.id,
      });
      await this.updateRefreshToken(user!.email, token.refresh_token);
      return new ResponseClass(
        token,
        HttpStatusCode.SUCCESS,
        'User logged in successfully',
      );
    }
  }
}
