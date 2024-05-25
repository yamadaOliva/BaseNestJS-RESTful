import {
  Controller,
  UseGuards,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorator';
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
}
