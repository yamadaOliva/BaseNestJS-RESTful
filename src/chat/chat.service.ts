import { ForbiddenException, Injectable, Inject } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseClass } from 'src/global';
import { HttpStatusCode } from 'src/global/globalEnum';
import { ChatDTO } from './chatDTO';
import { Redis } from 'ioredis';
import { stringUtils } from 'src/utils';
@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}
  async getChatByUserId(
    sourceId: string,
    targetId: string,
    limit: number,
    page: number,
    seen: boolean,
  ) {
    if (seen) {
      await this.seenMessage(sourceId, stringUtils.Compare(sourceId, targetId));
    }
    const subKey = stringUtils.Compare(sourceId, targetId);
    try {
      const list = await this.prisma.messagePrivate.findMany({
        where: {
          subKey: subKey,
        },
        take: limit,
        skip: (page - 1) * limit,
        orderBy: {
          createdAt: 'desc',
        },
      });

      return new ResponseClass(
        list.reverse(),
        HttpStatusCode.SUCCESS,
        'List chat',
      );
    } catch (error) {
      throw new ForbiddenException('Error');
    }
  }

  async createMessage(data: ChatDTO) {
    try {
      const content = await this.prisma.messagePrivate.create({
        data: {
          content: data.content,
          fromUserId: data.fromUserId,
          toUserId: data.toUserId,
          imageUrl: data.imageUrl,
          subKey: stringUtils.Compare(data.fromUserId, data.toUserId),
        },
      });
      return new ResponseClass(content, HttpStatusCode.SUCCESS, 'Message sent');
    } catch (error) {
      console.log(error);
    }
  }

  async getUserChatList(userId: string, limit: number, page: number) {
    try {
      //the last message of each conversation use distinct
      let list = await this.prisma.messagePrivate.findMany({
        where: {
          subKey: {
            contains: userId,
          },
        },
        select: {
          id: true,
          fromUserId: true,
          toUserId: true,
          content: true,
          imageUrl: true,
          createdAt: true,
          status: true,
          toUser: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              studentId: true,
              class: true,
            },
          },
          fromUser: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              studentId: true,
              class: true,
            },
          },
        },
        take: limit,
        skip: (page - 1) * limit,
        orderBy: {
          createdAt: 'desc',
        },
        distinct: ['subKey'],
      });
      //check online status
      const promises = list.map(async (item) => {
        if (item.fromUserId === userId) {
          const online = await this.redis.get(`online:${item.toUserId}`);
          return {
            ...item,
            online: online ? true : false,
          };
        }
        const online = await this.redis.get(`online:${item.fromUserId}`);
        return {
          ...item,
          online: online ? true : false,
        };
      });
      list = await Promise.all(promises);
      return new ResponseClass(list, HttpStatusCode.SUCCESS, 'List chat');
    } catch (error) {
      console.log(error);
    }
  }

  async seenMessage(userId: string, subKey: string) {
    try {
      const list = await this.prisma.messagePrivate.findMany({
        where: {
          subKey: subKey,
          toUserId: userId,
          status: 'UNREAD',
        },
      });
      const promises = list.map(async (item) => {
        await this.prisma.messagePrivate.update({
          where: {
            id: item.id,
          },
          data: {
            status: 'READ',
          },
        });
      });
      await Promise.all(promises);
      return new ResponseClass(null, HttpStatusCode.SUCCESS, 'Seen message');
    } catch (error) {
      console.log(error);
    }
  }

  getUnreadMessage = async (userId: string) => {
    try {
      const list = await this.prisma.messagePrivate.findMany({
        where: {
          toUserId: userId,
          status: 'UNREAD',
        },
        distinct: ['subKey'],
      });
      return new ResponseClass(list, HttpStatusCode.SUCCESS, 'List unread message');
    } catch (error) {
      console.log(error);
    }
  };
}
