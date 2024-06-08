import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  UseGuards,
  Param,
  ParseIntPipe,
  Delete,
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
  @Put('/accept')
  async acceptFriend(@Body('idRequest') idRequest: number) {
    console.log(idRequest);
    return await this.friendService.acceptFriend(idRequest);
  }

  @UseGuards(JwtGuard)
  @Put('/reject')
  async rejectFriend(@Body('idRequest') idRequest: number) {
    return await this.friendService.rejectFriend(idRequest);
  }

  @UseGuards(JwtGuard)
  @Get('/list/:page/:limit')
  async getFriendList(
    @GetUser() user,
    @Param('page', ParseIntPipe) page: number,
    @Param('limit', ParseIntPipe) limit: number,
  ) {
    return await this.friendService.getFriendList(user.user.id, limit, page);
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

  @UseGuards(JwtGuard)
  @Get('/search/:type/:keyword')
  async searchFriend(
    @GetUser() user,
    @Param('keyword') keyword: string,
    @Param('type') type: string,
  ) {
    return await this.friendService.searchFriend(user.user.id, keyword, type);
  }

  @UseGuards(JwtGuard)
  @Get('/filter/:type/:page/:limit')
  async filterFriend(
    @GetUser() user,
    @Param('type') type: string,
    @Param('page', ParseIntPipe) page: number,
    @Param('limit', ParseIntPipe) limit: number,
  ) {
    return await this.friendService.filterFriend(
      user.user.id,
      type,
      page,
      limit,
    );
  }

  @UseGuards(JwtGuard)
  @Get('/list/online/:page/:limit')
  async getListOnline(
    @GetUser() user,
    @Param('page', ParseIntPipe) page: number,
    @Param('limit', ParseIntPipe) limit: number,
  ) {
    return await this.friendService.getOnlineFriends(user.user.id, page, limit);
  }

  @UseGuards(JwtGuard)
  @Get('/search/idorname/:page/:limit/:keyword')
  async getFriendListByIdOrName(
    @GetUser() user,
    @Param('page', ParseIntPipe) page: number,
    @Param('limit', ParseIntPipe) limit: number,
    @Param('keyword') keyword: string,
  ) {
    return await this.friendService.getFriendByNameOrStudentId(
      user.user.id,
      keyword,
      limit,
      page,
    );
  }

  @UseGuards(JwtGuard)
  @Post('/follow')
  async followFriend(@GetUser() user, @Body('idTarget') idTarget: string) {
    return await this.friendService.followUser(user.user.id, idTarget);
  }

  @UseGuards(JwtGuard)
  @Delete('/unfollow/:idTarget')
  async unFollowFriend(@GetUser() user, @Param('idTarget') idTarget: string) {
    return await this.friendService.unfollowUser(user.user.id, idTarget);
  }

  @UseGuards(JwtGuard)
  @Get('check/:idTarget')
  async checkFriend(@GetUser() user, @Param('idTarget') idTarget: string) {
    return await this.friendService.checkFollowAndFriend(user.user.id, idTarget);
  }

  @UseGuards(JwtGuard)
  @Delete('/delete/:idTarget')
  async deleteFriend(@GetUser() user, @Param('idTarget') idTarget: string) {
    return await this.friendService.unFriend(user.user.id, idTarget);
  }

  @Get('/list/:id')
  async getFriendListFromId(@Param('id') id: string) {
    return await this.friendService.getFriendById(id);
  }
}
