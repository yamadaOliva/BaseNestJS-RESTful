import { ForbiddenException, Injectable ,Inject } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseClass } from 'src/global';
import { HttpStatusCode } from 'src/global/globalEnum';
import { ChatDTO } from './chatDTO';
import { Redis } from 'ioredis';
@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}
  async getChatByUserId(sourceId: string, targetId: string) {
    try {
      const list = await this.prisma.messagePrivate.findMany({
        where: {
          OR: [
            {
              AND: [
                {
                  fromUserId: sourceId,
                },
                {
                  toUserId: targetId,
                },
              ],
            },
            {
              AND: [
                {
                  fromUserId: targetId,
                },
                {
                  toUserId: sourceId,
                },
              ],
            },
          ],
        },
        orderBy: {
          createdAt: 'asc',
        },
      });
      return new ResponseClass(list, HttpStatusCode.SUCCESS, 'List chat');
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
        },
      });
      return new ResponseClass(content, HttpStatusCode.SUCCESS, 'Message sent');
    } catch (error) {
      console.log(error);
    }
  }

  async getUserChatList(userId: string, limit: number, page: number) {
    try {
      console.log(userId);
      //the last message of each conversation use distinct
      let list = await this.prisma.messagePrivate.findMany({
        where: {
          OR: [
            {
              fromUserId: userId,
            },
            {
              toUserId: userId,
            },
          ],
        },
        select: {
          id: true,
          fromUserId: true,
          toUserId: true,
          content: true,
          imageUrl: true,
          createdAt: true,
          toUser: {
            select: {
              name: true,
              avatarUrl: true,
              studentId: true,
            },
          },

          fromUser: {
            select: {
              name: true,
              avatarUrl: true,
              studentId: true,
            },
          },
        },
        take: limit,
        skip: (page - 1) * limit,
        orderBy: {
          createdAt: 'desc',
        },
        distinct: ['fromUserId', 'toUserId'],
      });
      //check online status
      const promises = list.map(async (item) => {
        if(item.fromUserId === userId){
          const online = await this.redis.get(`online:${item.toUserId}`);
          return {
            ...item,
            online: online? true : false,
          };
        }
        const online = await this.redis.get(`online:${item.fromUserId}`);
        return {
          ...item,
          online: online? true : false,
        };
      }
      );
      list = await Promise.all(promises);
      return new ResponseClass(list, HttpStatusCode.SUCCESS, 'List chat');
    } catch (error) {
      console.log(error);
    }
  }
}
