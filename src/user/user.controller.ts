import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import { User } from '@prisma/client';

@Controller('user')
export class UserController {
  @UseGuards(JwtGuard)
  @Get('me')
  me(@GetUser() user: User) {
    console.log(JSON.stringify(Object.keys(user)));
    return 'Hello World!';
  }
}
