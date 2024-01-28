import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { HttpStatusCode } from '../global/globalEnum';
import { ResponseClass } from '../global';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  async findOne(email: string): Promise<any> {
    console.log(email);
    const user = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
      select: {
        id: true,
        avatarUrl: true,
        name: true,
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
}
