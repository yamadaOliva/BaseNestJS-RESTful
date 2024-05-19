import { PrismaService } from 'src/prisma/prisma.service';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { HttpStatusCode } from '../global/globalEnum';
import { ResponseClass } from '../global';

@Injectable()
export class FriendService {
  constructor(private prisma: PrismaService) {}
  async addFriend(idSource: string, idTarget: string) {
    //check if friend request already exists
    try {
      const friendRequest = await this.prisma.friend.findFirst({
        where: {
          OR: [
            {
              userId: idSource,
              friendId: idTarget,
            },
            {
              userId: idTarget,
              friendId: idSource,
            },
          ],
        },
      });
      if (friendRequest) {
        throw new ForbiddenException('Friend request already exists');
      }
      await this.prisma.friend.create({
        data: {
          userId: idSource,
          friendId: idTarget,
          status: 'PENDING',
        },
      });
      return new ResponseClass(
        null,
        HttpStatusCode.SUCCESS,
        'Send friend request successfully',
      );
    } catch (error) {
      console.log(error);
    }
  }

  async acceptFriend(idRequest: number) {
    return await this.prisma.friend.update({
      where: {
        id: idRequest,
      },
      data: {
        status: 'ACCEPTED',
      },
    });
  }

  async rejectFriend(idRequest: number) {
    //delete friend request
    try {
      await this.prisma.friend.delete({
        where: {
          id: idRequest,
        },
      });
      return new ResponseClass(
        null,
        HttpStatusCode.SUCCESS,
        'Reject friend request successfully',
      );
    } catch (error) {
      throw new NotFoundException('Friend request not found');
    }
  }

  async getFriendList(id: string) {
    return await this.prisma.friend.findMany({
      where: {
        OR: [
          {
            userId: id,
          },
          {
            friendId: id,
          },
        ],
        status: 'ACCEPTED',
      },
      select: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            district: true,
            city: true,
            class: true,
            studentId: true,
          },
        },
      },
    });
  }

  async getFriendsRecommend(id: string): Promise<any> {
    try {
      const friends = await this.prisma.friend.findMany({
        where: {
          OR: [{ userId: id }, { friendId: id }],
        },
        select: {
          userId: true,
          friendId: true,
        },
      });
      console.log(friends);
      // Tạo danh sách các id bạn bè
      const friendIds = friends.map((friend) => {
        if (friend.userId === id) {
          return friend.friendId;
        } else {
          return friend.userId;
        }
      });

      const recommendedFriends = await this.prisma.user.findMany({
        where: {
          id: { notIn: friendIds.concat(id) },
        },
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      });

      return new ResponseClass(
        recommendedFriends,
        HttpStatusCode.SUCCESS,
        'Get friends recommendations successfully',
      );
    } catch (error) {
      throw new NotFoundException('Unable to get friends recommendations');
    }
  }

  async getFriendscountryman(
    id: string,
    page: number,
    per_page: number,
  ): Promise<any> {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: id,
        },
      });
      // check friends in the same city
      const userFriends = await this.prisma.friend.findMany({
        where: {
          OR: [{ userId: id }, { friendId: id }],
        },
        select: {
          userId: true,
          friendId: true,
        },
      });
        const userFriendIds = userFriends.map((friend) => {
            if (friend.userId === id) {
            return friend.friendId;
            } else {
            return friend.userId;
            }
        });

      const friends = await this.prisma.user.findMany({
        where: {
          city: user.city,
          id: {
            not: id,
            notIn: userFriendIds,
          },
        },
        skip: (page - 1) * per_page,
        take: per_page,
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          district: true,
          city: true,
          class: true,
          studentId: true,
        },
      });
      return new ResponseClass(
        friends,
        HttpStatusCode.SUCCESS,
        'Get friends countryman successfully',
      );
    } catch (error) {
      throw new NotFoundException('Unable to get friends countryman');
    }
  }

  async getListPendingRequest(id: string, page: number, limit: number) {
    try {
      console.log(id, page, limit);
      const requests = await this.prisma.friend.findMany({
        where: {
          friendId: id,
          status: 'PENDING',
        },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              district: true,
              city: true,
              class: true,
              studentId: true,
            },
          },
        },
      });
      console.log(requests);
      return new ResponseClass(
        requests,
        HttpStatusCode.SUCCESS,
        'Get list pending request successfully',
      );
    } catch (error) {
      throw new NotFoundException('Unable to get list pending request');
    }
  }
}
