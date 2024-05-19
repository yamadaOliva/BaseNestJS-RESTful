import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  UseGuards,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { FriendService } from './friend.service';
import { JwtGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorator';
@Controller('friend')
export class FriendController {
  constructor(private readonly friendService: FriendService) {}
  @UseGuards(JwtGuard)
  @Post('/add')
  async addFriend(@GetUser() user, @Body('idTarget') idTarget: string) {
    return await this.friendService.addFriend(user.user.id, idTarget);
  }

  @UseGuards(JwtGuard)
  @Put('/accept/:idRequest')
  async acceptFriend(@Param('idRequest') idRequest: number) {
    return await this.friendService.acceptFriend(idRequest);
  }

  @UseGuards(JwtGuard)
  @Put('/reject/:idRequest')
  async rejectFriend(@Param('idRequest') idRequest: number) {
    return await this.friendService.rejectFriend(idRequest);
  }

  @UseGuards(JwtGuard)
  @Get('/list')
  async getFriendList(@GetUser() user) {
    return await this.friendService.getFriendList(user.user.id);
  }

  @UseGuards(JwtGuard)
  @Get('/list/request/:page/:limit')
  async getFriendRequestList(
    @GetUser() user,
    @Param('page', ParseIntPipe) page: number,
    @Param('limit', ParseIntPipe) limit: number,
  ) {
    return await this.friendService.getListPendingRequest(
      user.user.id,
      page,
      limit,
    );
  }

  @UseGuards(JwtGuard)
  @Get('/list/countryman/:page/:limit')
  async getCountrymanRequestList(
    @GetUser() user,
    @Param('page', ParseIntPipe) page: number,
    @Param('limit', ParseIntPipe) limit: number,
  ) {
    return await this.friendService.getFriendscountryman(
      user.user.id,
      page,
      limit,
    );
  }
}
