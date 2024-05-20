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
    //convert schoolYear to number
    const schoolYearPtr = parseInt(authDTO.schoolYear);
    try {
      const user = await this.prisma.user.create({
        data: {
          email: authDTO.email,
          password: hashedPassword,
          name: authDTO.name,
          avatarUrl: "https://res.cloudinary.com/subarasuy/image/upload/v1716135390/prvieraqcydb8ehxjf8x.png",
          studentId: authDTO.studentId,
          majorId: authDTO.majorId,
          city: authDTO.city,
          district: authDTO.district,
          liveIn: authDTO.liveIn,
          Birthday: authDTO.Birthday,
          class: authDTO.class,
          interest: authDTO.interest,
          gender: authDTO.gender,
          schoolYear: schoolYearPtr,
          phone: authDTO.phone,
        },
      });
      delete user.password;
      delete user.updatedAt;
      if (user.name === null) delete user.name;
      const token: any = await this.convertToJwt({
        email: user.email,
        id: user.id,
      });
      await this.updateRefreshToken(user.email, token.refresh_token);
      await this.prisma.post.create({
        data: {
          userId: user.id,
          title: "Cảm thấy thấy phẩn khởi.",
          content:"Tôi là thành viên mới, mọi người giúp đỡ tôi nhé <3",
          imageUrl: "https://res.cloudinary.com/subarasuy/image/upload/v1716135269/cp0dnqxche5ivnry8lsc.jpg"
        },
      });
      return new ResponseClass(
        token,
        HttpStatusCode.SUCCESS,
        "User's account has been created successfully",
      );
    } catch (error) {
      console.log(error);
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

  async loginWith365Office(data:any){
    const email = data.email.toLowerCase();
    //delete last word of name
    const studentId = data.name.split(' ').slice(-1).join(' ');
    const name = data.name.split(' ').slice(0, -1).join(' ');
    //find email in database if not exist create new user password 123456
    const user = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (!user) {
      const hashedPassword = await argon.hash('123456');
      try {
        const user = await this.prisma.user.create({
          data: {
            email: email,
            password: hashedPassword,
            name: name,
            avatarUrl: "https://res.cloudinary.com/subarasuy/image/upload/v1716135390/prvieraqcydb8ehxjf8x.png",
            studentId: studentId,
            schoolYear: parseInt(studentId.slice(0, 4))
          },
        });
        delete user.password;
        delete user.updatedAt;
        if (user.name === null) delete user.name;
        const token: any = await this.convertToJwt({
          email: user.email,
          id: user.id,
        });
        await this.updateRefreshToken(user.email, token.refresh_token);
        await this.prisma.post.create({
          data: {
            userId: user.id,
            title: "Cảm thấy thấy phẩn khởi.",
            content:"Tôi là thành viên mới, mọi người giúp đỡ tôi nhé <3",
            imageUrl: "https://res.cloudinary.com/subarasuy/image/upload/v1716135269/cp0dnqxche5ivnry8lsc.jpg"
          },
        });
        return new ResponseClass(
          token,
          HttpStatusCode.SUCCESS,
          'User logged in successfully',
        );
      } catch (error) {
        console.log(error);
        if (error.code === 'P2002') {
          throw new ForbiddenException("User's email already exists");
        }
      }
    }else{
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
          'User logged in successfully',
        );
    }
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
