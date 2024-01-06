import { Controller, Get } from '@nestjs/common';
import { MajorsService } from './majors.service';

@Controller('major')
export class MajorsController {
  constructor(private readonly majorsService: MajorsService) {}
  @Get('/getAll')
  getMajors(): Promise<any> {
    return this.majorsService.getAllMajors();
  }
}
