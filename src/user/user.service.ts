import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { HttpStatusCode } from '../global/globalEnum';
import { ResponseClass } from '../global';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  async findOne(email: string): Promise<any> {
    console.log(email);
    try {
    } catch (error) {
      throw new NotFoundException('User not found');
    }
    const user = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
      select: {
        id: true,
        avatarUrl: true,
        name: true,
        role: true,
      },
    });
    if (user.name === null) {
      user.name = email;
    }
    return new ResponseClass(
      user,
      HttpStatusCode.SUCCESS,
      'Get user information successfully',
    );
  }

  async getProfile(email: string): Promise<any> {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email: email,
        },
      });
      delete user.password;
      return new ResponseClass(
        user,
        HttpStatusCode.SUCCESS,
        'Get user profile successfully',
      );
    } catch (error) {
      throw new NotFoundException('User not found');
    }
  }

  getProfileById = async (id: string): Promise<any> => {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: id,
        },
      });
      delete user.password;
      return new ResponseClass(
        user,
        HttpStatusCode.SUCCESS,
        'Get user profile successfully',
      );
    } catch (error) {
      throw new NotFoundException('User not found');
    }
  };

  async updateProfile(email: string, data: any): Promise<any> {
    console.log(data);
    try {
      const user = await this.prisma.user.update({
        where: {
          email: email,
        },
        data: {
          name: data.name,
          avatarUrl: data.avatarUrl,
          phone: data.phone,
          city: data.city,
          district: data.district,
          interest: data.interest,
          class: data.class,
          majorId: data.majorId,
          gender: data.gender,
          Birthday: data.birthday,
        },
      });
      return new ResponseClass(
        user,
        HttpStatusCode.SUCCESS,
        'Update user profile successfully',
      );
    } catch (error) {
      throw new NotFoundException('User not found');
    }
  }

  async getListUser(
    userId: string,
    page: number,
    per_page: number,
  ): Promise<any> {
    const count = await this.prisma.user.count({
      where: {
        NOT: {
          id: userId,
        },
      },
    });
    const checkAdmin = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (checkAdmin.role !== 'ADMIN') {
      throw new NotFoundException('Đã xảy ra lỗi');
    }
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        class: true,
        studentId: true,
        statusAccount: true,
      },
      take: per_page,
      skip: (page - 1) * per_page,
      where: {
        NOT: {
          id: userId,
        },
      },
    });
    return new ResponseClass(
      {
        data: users,
        total: count,
      },

      HttpStatusCode.SUCCESS,
      'Get list user successfully',
    );
  }

  async banUser(userId: string, bannedId: string): Promise<any> {
    const checkAdmin = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (checkAdmin.role !== 'ADMIN') {
      throw new NotFoundException('Đã xảy ra lỗi');
    }
    const user = await this.prisma.user.update({
      where: {
        id: bannedId,
      },
      data: {
        statusAccount: 'BLOCKED',
      },
    });
    return new ResponseClass(
      user,
      HttpStatusCode.SUCCESS,
      'Ban user successfully',
    );
  }

  async unbanUser(userId: string, bannedId: string): Promise<any> {
    const checkAdmin = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (checkAdmin.role !== 'ADMIN') {
      throw new NotFoundException('Đã xảy ra lỗi');
    }
    const user = await this.prisma.user.update({
      where: {
        id: bannedId,
      },
      data: {
        statusAccount: 'ACTIVE',
      },
    });
    return new ResponseClass(
      user,
      HttpStatusCode.SUCCESS,
      'Unban user successfully',
    );
  }

  async getUserByNameOrStudentId(
    name: string,
    field: string,
    page: number,
    per_page: number,
  ): Promise<any> {
    try {
      if (field === 'name') {
        const count = await this.prisma.user.count({
          where: {
            name: {
              contains: name,
              mode: 'insensitive',
            },
          },
        });
        const users = await this.prisma.user.findMany({
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            class: true,
            studentId: true,
            statusAccount: true,
          },
          take: per_page,
          skip: (page - 1) * per_page,
          where: {
            name: {
              contains: name,
            },
          },
        });
        return new ResponseClass(
          {
            data: users,
            total: count,
          },

          HttpStatusCode.SUCCESS,
          'Get list user successfully',
        );
      } else if (field === 'studentId') {
        const count = await this.prisma.user.count({
          where: {
            studentId: {
              contains: name,
              mode: 'insensitive',
            },
          },
        });
        const users = await this.prisma.user.findMany({
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            class: true,
            studentId: true,
            statusAccount: true,
          },
          take: per_page,
          skip: (page - 1) * per_page,
          where: {
            studentId: {
              contains: name,
            },
          },
        });
        return new ResponseClass(
          {
            data: users,
            total: count,
          },

          HttpStatusCode.SUCCESS,
          'Get list user successfully',
        );
      }
    } catch (error) {}
  }
}
