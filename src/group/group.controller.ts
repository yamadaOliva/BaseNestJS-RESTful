import { Controller, Post, Body, Get } from '@nestjs/common';
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
    console.log(user, name);
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
    console.log(user.user.id);
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
}
