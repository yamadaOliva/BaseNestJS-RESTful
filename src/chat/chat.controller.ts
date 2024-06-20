import {
  Controller,
  UseGuards,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Body,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorator';
import { ChatDTO } from './chatDTO';
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(JwtGuard)
  @Get('/list/friend/:page/:limit')
  async getFriendList(
    @GetUser() user,
    @Param('page', ParseIntPipe) page: number,
    @Param('limit', ParseIntPipe) limit: number,
  ) {
  }

  @UseGuards(JwtGuard)
  @Post('/send')
  async sendMessage(@Body() body) {
    return await this.chatService.createMessage(body);
  }

  @UseGuards(JwtGuard)
  @Get('/list/:targetId/:page/:limit/:seen')
  async getChatByUserId(
    @GetUser() user,
    @Param('targetId') targetId: string,
    @Param('page', ParseIntPipe) page: number,
    @Param('limit', ParseIntPipe) limit: number,
    @Param('seen') seen: boolean,
  ) {
    return await this.chatService.getChatByUserId(
      user.user.id,
      targetId,
      limit,
      page,
      seen,
    );
  }

  @UseGuards(JwtGuard)
  @Get('/unseen')
  async getUnseenMessage(@GetUser() user) {
    return await this.chatService.getUnreadMessage(user.user.id);
  }
}
