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
    try {
      //update friend request status
      const { userId, friendId } = await this.prisma.friend.findUnique({
        where: {
          id: idRequest,
        },
        select: {
          userId: true,
          friendId: true,
        },
      });
      const nameFriend = await this.prisma.user.findUnique({
        where: {
          id: friendId,
        },
        select: {
          name: true,
        },
      });
      await this.prisma.friend.update({
        where: {
          id: idRequest,
        },
        data: {
          status: 'ACCEPTED',
        },
      });
      await this.prisma.notification.create({
        data: {
          userId: userId,
          content: `${nameFriend.name} đã chấp nhận lời mời kết bạn của bạn`,
          type: 'FRIEND',
        },
      });

      return new ResponseClass(
        null,
        HttpStatusCode.SUCCESS,
        'Accept friend request successfully',
      );
    } catch (error) {
      throw new NotFoundException('Friend request not found');
    }
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

  async getFriendList(id: string, per_page: number, page: number) {
    try {
      // Lấy tổng số bạn
      const totalFriends = await this.prisma.friend.count({
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
      });

      // Lấy danh sách bạn bè với phân trang
      const friends1 = await this.prisma.friend.findMany({
        where: {
          friendId: id,
          status: 'ACCEPTED',
        },
        skip: (page - 1) * per_page,
        take: per_page,
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

      const friends2 = await this.prisma.friend.findMany({
        where: {
          userId: id,
          status: 'ACCEPTED',
        },
        skip: (page - 1) * per_page,
        take: per_page,
        select: {
          id: true,
          friend: {
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
      let friends = friends2.map((friend) => {
        return {
          id: friend.id,
          user: {
            ...friend?.friend
          }
        };
      });
      friends = friends.concat(friends1);
      return new ResponseClass(
        { friends, totalFriends },
        HttpStatusCode.SUCCESS,
        'Get friend list successfully',
      );
    } catch (error) {
      console.error(error);
      return new ResponseClass(
        null,
        HttpStatusCode.FORBIDDEN,
        'Failed to get friend list',
      );
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
        orderBy: {
          createdAt: 'desc',
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

  async searchFriend(id: string, keyword: string, type: string) {
    console.log(id, keyword, type);
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
      const friendIds = friends.map((friend) => {
        if (friend.userId === id) {
          return friend.friendId;
        } else {
          return friend.userId;
        }
      });
      switch (type) {
        case 'name':
          const ans = await this.prisma.user.findMany({
            where: {
              id: { notIn: friendIds.concat(id) },
              name: {
                contains: keyword,
                mode: 'insensitive',
              },
            },
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
            ans,
            HttpStatusCode.SUCCESS,
            'Search friend by name successfully',
          );
        case 'studentId':
          const ans2 = await this.prisma.user.findMany({
            where: {
              id: { notIn: friendIds.concat(id) },
              studentId: {
                contains: keyword,
                mode: 'insensitive',
              },
            },
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
            ans2,
            HttpStatusCode.SUCCESS,
            'Search friend by studentId successfully',
          );
        default:
          break;
      }
    } catch (error) {
      console.log(error);
    }
  }

  async filterFriend(id: string, type: string, page: number, per_page: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: id,
        },
      });
      console.log(user);
      const friends = await this.prisma.friend.findMany({
        where: {
          OR: [{ userId: id }, { friendId: id }],
        },
        select: {
          userId: true,
          friendId: true,
        },
      });
      const friendIds = friends.map((friend) => {
        if (friend.userId === id) {
          return friend.friendId;
        } else {
          return friend.userId;
        }
      });
      switch (type) {
        case 'sameSchoolYear':
          const friendList = await this.prisma.user.findMany({
            where: {
              id: { notIn: friendIds.concat(id) },
              schoolYear: {
                equals: user.schoolYear,
              },
              majorId: {
                equals: user.majorId,
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
            friendList,
            HttpStatusCode.SUCCESS,
            'Get friends by same school year successfully',
          );
        case 'sameMajor':
          const friendList2 = await this.prisma.user.findMany({
            where: {
              id: { notIn: friendIds.concat(id) },
              majorId: {
                equals: user.majorId,
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
          console.log(friendList2);
          return new ResponseClass(
            friendList2,
            HttpStatusCode.SUCCESS,
            'Get friends by same major successfully',
          );
        case 'sameClass':
          const friendList3 = await this.prisma.user.findMany({
            where: {
              id: { notIn: friendIds.concat(id) },
              class: {
                equals: user.class,
              },
              schoolYear: {
                equals: user.schoolYear,
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
            friendList3,
            HttpStatusCode.SUCCESS,
            'Get friends by same class successfully',
          );
        default:
          break;
      }
    } catch (error) {
      console.log(error);
    }
  }
}
