import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseClass } from 'src/global';
import { HttpStatusCode } from '../global/globalEnum';

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaService) {}
  async createReport(data: any) {
    try {
      const report = await this.prisma.report.create({
        data: {
          ...data,
        },
      });
      return new ResponseClass(
        report,
        HttpStatusCode.SUCCESS,
        'Report created successfully',
      );
    } catch (error) {
      console.log(error);
    }
  }

  async getReportById(id: string) {
    try {
      const report = await this.prisma.report.findUnique({
        where: {
          id: id,
        },
      });
      return new ResponseClass(
        report,
        HttpStatusCode.SUCCESS,
        'Get report successfully',
      );
    } catch (error) {
      console.log(error);
    }
  }

  async getReports(page: number, limit: number) {
    try {
      const count = await this.prisma.report.count();
      const reports = await this.prisma.report.findMany({
        include: {
          user: true,
          userReported: true,
          comment: true,
        },
        skip: (page - 1) * limit,
        take: limit,
      });
      return new ResponseClass(
        { reports, total: count },
        HttpStatusCode.SUCCESS,
        'Get reports successfully',
      );
    } catch (error) {
      console.log(error);
    }
  }

  async deleteReport(id: string) {
    try {
      const report = await this.prisma.report.delete({
        where: {
          id: id,
        },
      });
      return new ResponseClass(
        report,
        HttpStatusCode.SUCCESS,
        'Report deleted successfully',
      );
    } catch (error) {
      console.log(error);
    }
  }
}
