import { Controller } from '@nestjs/common';
import { ReportService } from './report.service';
import { Post , Body } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorator';

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @UseGuards(JwtGuard)
  @Post("/create")
  createReport(@GetUser() user : any,@Body() data: any) {
    return this.reportService.createReport({
      ...data,
      userId: user.user.id
    })
  }
}
