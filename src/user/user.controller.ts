import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
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
  updateProfile(@Body() userData: any, @GetUser() user: any) {
    return this.userService.updateProfile(user.user.email, userData);
  }

  @UseGuards(JwtGuard)
  @Get('/profile/:id')
  getProfileById(@Param() id: any) {
    return this.userService.getProfileById(id.id);
  }

  @UseGuards(JwtGuard)
  @Get('/list/:page/:limit')
  list(
    @GetUser() user: any,
    @Param('page', ParseIntPipe) page: number,
    @Param('limit', ParseIntPipe) limit: number,
  ) {
    return this.userService.getListUser(user.user.id, page, limit);
  }

  @UseGuards(JwtGuard)
  @Put('/ban/:id')
  banUser(@GetUser() user, @Param() id: any) {
    return this.userService.banUser(user.user.id, id.id);
  }

  @UseGuards(JwtGuard)
  @Put('/unban/:id')
  unbanUser(@GetUser() user, @Param() id: any) {
    return this.userService.unbanUser(user.user.id, id.id);
  }

  @UseGuards(JwtGuard)
  @Get('/search/:name/:field/:page/:limit')
  search(
    @Param('name') name: string,
    @Param('field') field: string,
    @Param('page', ParseIntPipe) page: number,
    @Param('limit', ParseIntPipe) limit: number,
  ) {
    return this.userService.getUserByNameOrStudentId(
      name,
      field,
      page,
      limit,
    );
  }

}
