import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ReportService } from './report.service';
import { JwtGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorator';

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @UseGuards(JwtGuard)
  @Post('/create')
  createReport(@GetUser() user: any, @Body() data: any) {
    return this.reportService.createReport({
      ...data,
      userId: user.user.id,
    });
  }

  @UseGuards(JwtGuard)
  @Get('/list/:page/:limit')
  getReports(
    @GetUser() user: any,
    @Param('page', ParseIntPipe) page: number,
    @Param('limit', ParseIntPipe) limit: number,
  ) {
    return this.reportService.getReports(page, limit);
  }
}
