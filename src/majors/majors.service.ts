import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { HttpStatusCode } from 'src/global/globalEnum';
@Injectable()
export class MajorsService {
  constructor(private readonly prisma: PrismaService) {}
  async getAllMajors() {
    try {
      const majors = await this.prisma.major.findMany({
        select: {
          id: true,
          name: true,
          acronym: true,
          classCount: {
            select: {
              schoolYear: true,
              count: true,
            },
          },
        },
      });
      return {
        statusCode: HttpStatusCode.SUCCESS,
        message: 'Success',
        data: majors,
      };
    } catch (error) {
      throw error;
    }
  }
}
