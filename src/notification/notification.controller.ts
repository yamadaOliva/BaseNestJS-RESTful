import { Controller, Delete, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorator';
import { Get, Param, ParseIntPipe, Put} from '@nestjs/common';
@Controller('notification')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @UseGuards(JwtGuard)
  @Get('/list/:page/:limit')
  async getNotificationByUserId(
    @GetUser() user,
    @Param('page', ParseIntPipe) page: number,
    @Param('limit', ParseIntPipe) limit: number,
  ) {
    return await this.notificationService.getNotificationByUserId(
      user.user.id,
      limit,
      page,
    );
  }

  @UseGuards(JwtGuard)
  @Put('/read')
  async setReadNotification(@GetUser() user) {
    return await this.notificationService.setReadNotification(user.user.id);
  }

  @UseGuards(JwtGuard)
  @Delete('/delete/:id')
  async deleteNotification(
    @GetUser() user,
    @Param('id') id: string,
  ) {
    return await this.notificationService.deleteNotification(user.user.id, id);
  }
}
