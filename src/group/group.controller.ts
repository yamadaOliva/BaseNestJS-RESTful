import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { GroupService } from './group.service';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorator';
@Controller('group')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @UseGuards(JwtGuard)
  @Post('create')
  async createGroup(@GetUser() user, @Body('name') name: string) {
    return await this.groupService.createGroup(user.user.id, name);
  }

  @UseGuards(JwtGuard)
  @Get('list')
  async getGroupList(@GetUser() user) {
    return await this.groupService.getGroups(user.user.id);
  }

  @UseGuards(JwtGuard)
  @Get('recommend')
  async getRecommendGroup(@GetUser() user) {
    return await this.groupService.recommendGroup(user.user.id);
  }

  @UseGuards(JwtGuard)
  @Post('join')
  async joinGroup(@GetUser() user, @Body('groupId') groupId: string) {
    return await this.groupService.requestToJoinGroup(user.user.id, groupId);
  }

  @UseGuards(JwtGuard)
  @Post('leave')
  async leaveGroup(@GetUser() user, @Body('groupId') groupId: string) {
    return await this.groupService.leaveGroup(user.user.id, groupId);
  }

  @UseGuards(JwtGuard)
  @Get('/:id')
  async getGroupDetail(@GetUser() user, @Param('id') id: string) {
    return await this.groupService.findGroupById(id);
  }

  @UseGuards(JwtGuard)
  @Get(':id/requests')
  async getRequestList(@GetUser() user, @Param('id') id: string) {
    return await this.groupService.getRequestList(id);
  }

  @UseGuards(JwtGuard)
  @Post('accept')
  async acceptRequest(@GetUser() user, @Body('requestId') requestId: string) {
    return await this.groupService.acceptRequest(requestId);
  }

  @UseGuards(JwtGuard)
  @Post('reject')
  async rejectRequest(@GetUser() user, @Body('requestId') requestId: string) {
    return await this.groupService.rejectRequest(requestId);
  }

  @UseGuards(JwtGuard)
  @Post('deleteUser')
  async deleteGroup(
    @GetUser() user,
    @Body('groupId') groupId: string,
    @Body('userId') userId: string,
  ) {
    return await this.groupService.deleteMember(user.user.id, groupId, userId);
  }

  @UseGuards(JwtGuard)
  @Get('search/:name')
  async searchGroup(@Param('name') name: string) {
    return await this.groupService.findGroupByName(name);
  }
}
