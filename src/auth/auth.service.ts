import { ForbiddenException, Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDTO } from './dto';
import { ResponseClass } from '../global';
import { HttpStatusCode } from '../global/globalEnum';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { Redis } from 'ioredis';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    @InjectQueue('sendMail') private readonly sendMailQueue: Queue,
  ) {}

  async setOnlineStatus(id: string) {
    await this.redis.set(`online:${id}`, 'true', 'EX', 6000);
  }

  setOfflineStatus = async (id: string) => {
    await this.redis.del(`online:${id}`);
  };

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
          avatarUrl:
            'https://res.cloudinary.com/subarasuy/image/upload/v1716135390/prvieraqcydb8ehxjf8x.png',
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
          title: 'Cảm thấy thấy phẩn khởi.',
          content: 'Tôi là thành viên mới, mọi người giúp đỡ tôi nhé <3',
          imageUrl:
            'https://res.cloudinary.com/subarasuy/image/upload/v1716135269/cp0dnqxche5ivnry8lsc.jpg',
        },
      });
      const randomToken = crypto.randomBytes(64).toString('hex');
      let activeToken = await argon.hash(user.email + randomToken);
      // delele "/"
      activeToken = activeToken.replace(/\//g, '');
      await this.prisma.activeCode.create({
        data: {
          userId: user.id,
          code: activeToken,
        },
      });
      await this.sendMailQueue.add('register', {
        email: user.email,
        name: user.name,
        activeToken: activeToken,
      });

      return new ResponseClass(
        token,
        HttpStatusCode.SUCCESS,
        "User's account has been created successfully",
      );
    } catch (error) {
      console.log(error);
      if (error.code === 'P2002') {
        return new ResponseClass(
          null,
          HttpStatusCode.ERROR,
          'email đã tồn tại',
        );
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
      if (user.statusAccount == 'BLOCKED')
        return new ResponseClass(
          null,
          HttpStatusCode.ERROR,
          'Tài khoản của bạn đã bị khóa',
        );
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

          if (user.statusAccount === 'INACTIVE') {
            const randomToken = crypto.randomBytes(64).toString('hex');
            let activeToken = await argon.hash(user.email + randomToken);
            activeToken = activeToken.replace(/\//g, '');
            await this.prisma.activeCode.create({
              data: {
                userId: user.id,
                code: activeToken,
              },
            });
            await this.sendMailQueue.add('register', {
              email: user.email,
              name: user.name,
              activeToken: activeToken,
            });
            return new ResponseClass(
              null,
              HttpStatusCode.ERROR,
              'Tài khoản của bạn chưa được kích hoạt, vui lòng kiểm tra email để kích hoạt tài khoản',
            );
          }
          return new ResponseClass(
            token,
            HttpStatusCode.SUCCESS,
            'User logged in successfully',
          );
        } else {
          return new ResponseClass(
            null,
            HttpStatusCode.ERROR,
            'Email hoặc mật khẩu không đúng',
          );
        }
      } else {
        return new ResponseClass(
          null,
          HttpStatusCode.ERROR,
          'Email hoặc mật khẩu không đúng',
        );
      }
    } catch (error) {
      console.log(error);
      return new ResponseClass(
        null,
        HttpStatusCode.ERROR,
        'Đăng nhập thất bại',
      );
    }
  }

  async convertToJwt(user: { email: string; id: string }): Promise<any> {
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

  async loginWith365Office(data: any) {
    const email = data.email.toLowerCase();
    const studentId = data.name.split(' ').slice(-1).join(' ');
    const name = data.name.split(' ').slice(0, -1).join(' ');
    const user = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (!user) {
      const randomPassword = crypto.randomBytes(64).toString('hex');
      const hashedPassword = await argon.hash(randomPassword);
      await this.sendMailQueue.add('sendPassword', {
        email: email,
        name: name,
        password: randomPassword,
      });
      try {
        const user = await this.prisma.user.create({
          data: {
            email: email,
            password: hashedPassword,
            name: name,
            avatarUrl:
              'https://res.cloudinary.com/subarasuy/image/upload/v1716135390/prvieraqcydb8ehxjf8x.png',
            studentId: studentId,
            schoolYear: parseInt(studentId.slice(0, 4)),
            statusAccount: 'ACTIVE',
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
            title: 'Cảm thấy thấy phẩn khởi.',
            content: 'Tôi là thành viên mới, mọi người giúp đỡ tôi nhé <3',
            imageUrl:
              'https://res.cloudinary.com/subarasuy/image/upload/v1716135269/cp0dnqxche5ivnry8lsc.jpg',
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
    } else {
      if (user.statusAccount === 'BLOCKED') {
        return new ResponseClass(
          null,
          HttpStatusCode.ERROR,
          'Tài khoản của bạn đã bị khóa',
        );
      }
      if (user.statusAccount === 'INACTIVE') {
        await this.prisma.user.update({
          where: {
            email: email,
          },
          data: {
            statusAccount: 'ACTIVE',
          },
        });
      }
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

  async logout(email: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (!user) throw new ForbiddenException("User's email is incorrect");
    await this.updateRefreshToken(user.email, '');
    await this.setOfflineStatus(user.id);
    return new ResponseClass(
      null,
      HttpStatusCode.SUCCESS,
      'User logged out successfully',
    );
  }

  async activeAccount(code: string) {
    try {
      const activeCode = await this.prisma.activeCode.findFirst({
        where: {
          code: code,
        },
      });
      if (!activeCode) {
        return new ResponseClass(
          null,
          HttpStatusCode.ERROR,
          'The code is incorrect',
        );
      }
      await this.prisma.user.update({
        where: {
          id: activeCode.userId,
        },
        data: {
          statusAccount: 'ACTIVE',
        },
      });
      //delete all code
      await this.prisma.activeCode.deleteMany({
        where: {
          userId: activeCode.userId,
        },
      });
      return new ResponseClass(
        null,
        HttpStatusCode.SUCCESS,
        'User account has been activated successfully',
      );
    } catch (error) {
      console.log(error);
    }
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (!user) {
      return new ResponseClass(
        null,
        HttpStatusCode.ERROR,
        'Email không tồn tại',
      );
    }
    const randomToken = crypto.randomBytes(64).toString('hex');
    let resetToken = await argon.hash(user.email + randomToken);
    resetToken = resetToken.replace(/\//g, '');
    await this.redis.set(resetToken, user.id, 'EX', 6000);
    await this.sendMailQueue.add('forgotPassword', {
      email: user.email,
      name: user.name,
      resetToken: resetToken,
    });
    return new ResponseClass(
      null,
      HttpStatusCode.SUCCESS,
      'Please check your email to reset password',
    );
  }

  async verifyResetPasswordToken(token: string) {
    const userId = await this.redis.get(token);
    if (!userId) {
      return new ResponseClass(
        null,
        HttpStatusCode.ERROR,
        'The token is incorrect',
      );
    }
    return new ResponseClass(null, HttpStatusCode.SUCCESS, 'Token is correct');
  }

  async resetPassword(token: string, password: string) {
    const userId = await this.redis.get(token);
    if (!userId) {
      return new ResponseClass(
        null,
        HttpStatusCode.ERROR,
        'The token is incorrect',
      );
    }
    const hashedPassword = await argon.hash(password);
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: hashedPassword,
      },
    });
    await this.redis.del(token);
    return new ResponseClass(
      null,
      HttpStatusCode.SUCCESS,
      'Password has been reset successfully',
    );
  }

  async changePassword(id: string, oldPassword: string, newPassword: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: id,
        },
      });
      if (!user) {
        return new ResponseClass(
          null,
          HttpStatusCode.ERROR,
          'Không tìm thấy người dùng',
        );
      }
      const isPasswordValid = await argon.verify(user.password, oldPassword);
      if (!isPasswordValid) {
        return new ResponseClass(
          null,
          HttpStatusCode.ERROR,
          'Mật khẩu cũ không đúng',
        );
      }
      const hashedPassword = await argon.hash(newPassword);
      await this.prisma.user.update({
        where: {
          id: id,
        },
        data: {
          password: hashedPassword,
        },
      });
      return new ResponseClass(
        null,
        HttpStatusCode.SUCCESS,
        'Password has been changed successfully',
      );
    } catch (error) {
      console.log(error);
    }
  }
}
