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
    console.log(user, page, limit);
    return await this.chatService.getUserChatList(user.user.id, limit, page);
  }

  @UseGuards(JwtGuard)
  @Post('/send')
  async sendMessage(@Body() body) {
    return await this.chatService.createMessage(body);
  }

  @UseGuards(JwtGuard)
  @Get('/list/:targetId/:page/:limit')
  async getChatByUserId(
    @GetUser() user,
    @Param('targetId') targetId: string,
    @Param('page', ParseIntPipe) page: number,
    @Param('limit', ParseIntPipe) limit: number,
  ) {
    return await this.chatService.getChatByUserId(
      user.user.id,
      targetId,
      limit,
      page,
    );
  }
}
