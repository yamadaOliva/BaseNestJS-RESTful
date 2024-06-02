import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { HttpStatusCode } from '../global/globalEnum';
import { ResponseClass } from '../global';
@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async getNotificationByUserId(
    userId: string,
    per_page: number,
    page: number,
  ) {
    try {
      const notifications = await this.prisma.notification.findMany({
        where: {
          userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: per_page,
        skip: per_page * (page - 1),
      });
      return new ResponseClass(
        notifications,
        HttpStatusCode.SUCCESS,
        'Notifications found',
      );
    } catch (error) {
      console.log(error);
    }
  }

  async setReadNotification(userId: string) {
    try {
      await this.prisma.notification.updateMany({
        where: {
          AND: [
            {
              userId,
            },
            {
              status: 'UNREAD',
            },
          ],
        },
        data: {
          status: 'READ',
        },
      });
      return new ResponseClass(
        null,
        HttpStatusCode.SUCCESS,
        'Notifications marked as read',
      );
    } catch (error) {
      console.log(error);
    }
  }

  async deleteNotification(userId: string, notificationId: string) {
    try {
      await this.prisma.notification.delete({
        where: {
          id: notificationId,
          userId: userId,
        },
      });
      return new ResponseClass(
        null,
        HttpStatusCode.SUCCESS,
        'Notification deleted',
      );
    } catch (error) {
      console.log(error);
    }
  }
}
