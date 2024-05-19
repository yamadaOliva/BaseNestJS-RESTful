import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import { UserService } from './user.service';
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  @UseGuards(JwtGuard)
  @Get('/me')
  me(@GetUser() user: any) {
    return this.userService.findOne(user.user.email);
  }

  @UseGuards(JwtGuard)
  @Get('/profile')
  profile(@GetUser() user: any) {
    return this.userService.getProfile(user.user.email);
  }

  @UseGuards(JwtGuard)
  @Put('/profile')
  updateProfile(@Body() userData: any, @GetUser() user: any){
    return this.userService.updateProfile(user.user.email, userData);
  }

  @UseGuards(JwtGuard)
  @Get('/profile/:id')
  getProfileById(@Param() id : any) {
    console.log(id);
    return this.userService.getProfileById(id.id);
  }

}
