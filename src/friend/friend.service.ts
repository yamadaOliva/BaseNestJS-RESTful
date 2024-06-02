import { PrismaService } from 'src/prisma/prisma.service';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { HttpStatusCode } from '../global/globalEnum';
import { ResponseClass } from '../global';
import { Redis } from 'ioredis';
import { stringUtils } from 'src/utils';
@Injectable()
export class FriendService {
  constructor(
    private prisma: PrismaService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  async addFriend(idSource: string, idTarget: string) {
    // check if friend request already exists
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
      // update friend request status
      const { userId, friendId } = await this.prisma.friend.findUnique({
        where: {
          id: idRequest,
        },
        select: {
          userId: true,
          friendId: true,
        },
      });
      await this.prisma.messagePrivate.create({
        data: {
          toUserId: userId,
          fromUserId: friendId,
          content: 'Chào bạn mới',
          subKey: stringUtils.Compare(userId, friendId),
        },
      });
      const nameFriend = await this.prisma.user.findUnique({
        where: {
          id: friendId,
        },
        select: {
          name: true,
          avatarUrl: true,
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
          sourceAvatarUrl: nameFriend.avatarUrl,
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
    // delete friend request
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
      const mutualFriendsPromises1 = friends1.map(async (friend) => ({
        id: friend.id,
        user: { ...friend.user },
        mutualFriends: await this.findMutualFriends(id, friend.user.id),
      }));

      const mutualFriendsPromises2 = friends2.map(async (friend) => ({
        id: friend.id,
        user: { ...friend.friend },
        mutualFriends: await this.findMutualFriends(id, friend.friend.id),
      }));

      const friends = await Promise.all([
        ...mutualFriendsPromises1,
        ...mutualFriendsPromises2,
      ]);
      // Save to Redis

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

      // Save to Redis
      await this.redis.set(`friends_countryman:${id}`, JSON.stringify(friends));

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

      // Save to Redis
      await this.redis.set(`pending_requests:${id}`, JSON.stringify(requests));

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

  async loadFriendsToRedis(id: string) {
    try {
      //delete old data
      const friends1 = await this.prisma.friend.findMany({
        where: {
          friendId: id,
          status: 'ACCEPTED',
        },
        select: {
          userId: true,
        },
      });
      const friends2 = await this.prisma.friend.findMany({
        where: {
          userId: id,
          status: 'ACCEPTED',
        },
        select: {
          friendId: true,
        },
      });

      const friendIds = friends1.map((friend) => friend.userId);
      friendIds.push(...friends2.map((friend) => friend.friendId));
      const promises = friendIds.map(async (friendId) => {
        this.redis.sadd(`friends:${id}:test`, friendId);
      });
      await Promise.all(promises);
    } catch (error) {
      console.error(error);
    }
  }

  async findMutualFriends(id1: string, id2: string) {
    try {
      // get mutual friends
      let mutualFriends = await this.redis.smembers(
        `mutualFriends:${id1}:${id2}`,
      );
      if (mutualFriends) {
        return mutualFriends.length;
      } else {
        const friends1 = await this.redis.smembers(`friends:${id1}:test`);
        const friends2 = await this.redis.smembers(`friends:${id2}:test`);
        if (friends1 && friends2) {
          const count = await this.redis.sinterstore(
            `mutualFriends:${id1}:${id2}`,
            `friends:${id1}:test`,
            `friends:${id2}:test`,
          );
          return count;
        }
        if (!friends1) {
          this.loadFriendsToRedis(id1);
        }
        if (!friends2) {
          this.loadFriendsToRedis(id2);
        }
        const count = await this.redis.sinterstore(
          `mutualFriends:${id1}:${id2}`,
          `friends:${id1}:test`,
          `friends:${id2}:test`,
        );
        return count;
      }
    } catch (error) {
      console.error(error);
    }
  }

  async getOnlineFriends(id: string, page: number, per_page: number) {
    try {
      const friends = await this.prisma.friend.findMany({
        where: {
          OR: [{ userId: id }, { friendId: id }],
          status: 'ACCEPTED',
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
      const onlineFriends = await this.redis.keys('online:*');
      const onlineFriendsId = onlineFriends.map((friend) =>
        friend.replace('online:', ''),
      );
      const onlineFriendsId2 = onlineFriendsId.filter((friend) =>
        friendIds.includes(friend),
      );
      const onlineFriendsInfo = await this.prisma.user
        .findMany({
          where: {
            id: {
              in: onlineFriendsId2,
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
        })
        .then((res) => {
          return res.map((friend) => {
            return { ...friend, online: true };
          });
        });
      return new ResponseClass(
        onlineFriendsInfo,
        HttpStatusCode.SUCCESS,
        'Get online friends successfully',
      );
    } catch (error) {
      console.error(error);
    }
  }

  async getFriendByNameOrStudentId(
    id: string,
    keyword: string,
    per_page: number,
    page: number,
  ) {
    try {
      const friend1 = await this.prisma.friend.findMany({
        where: {
          userId: id,
          status: 'ACCEPTED',
        },
        select: {
          friendId: true,
        },
      });
      const friend2 = await this.prisma.friend.findMany({
        where: {
          friendId: id,
          status: 'ACCEPTED',
        },
        select: {
          userId: true,
        },
      });
      const friendIds = friend1.map((friend) => friend.friendId);
      friendIds.push(...friend2.map((friend) => friend.userId));

      let friendList = await this.prisma.user.findMany({
        where: {
          id: { in: friendIds },
          OR: [
            {
              name: {
                contains: keyword,
                mode: 'insensitive',
              },
            },
            {
              studentId: {
                contains: keyword,
                mode: 'insensitive',
              },
            },
          ],
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
      //online status
      const promises = friendList.map(async (friend) => {
        const isOnline = await this.redis.get(`online:${friend.id}`);
        return { ...friend, isOnline: isOnline ? true : false };
      });
      friendList = await Promise.all(promises);
      return new ResponseClass(
        friendList,
        HttpStatusCode.SUCCESS,
        'Get friend by name or studentId successfully',
      );
    } catch (error) {
      console.error(error);
    }
  }

  async followUser(id: string, idTarget: string) {
    try {
      const follow = await this.prisma.follow.findFirst({
        where: {
          userId: id,
          followId: idTarget,
        },
      });
      if (follow) {
        throw new ForbiddenException('Follow request already exists');
      }
      await this.prisma.follow.create({
        data: {
          userId: id,
          followId: idTarget,
        },
      });
      return new ResponseClass(
        null,
        HttpStatusCode.SUCCESS,
        'Follow user successfully',
      );
    } catch (error) {
      console.error(error);
    }
  }

  async unfollowUser(id: string, idTarget: string) {
    try {
      await this.prisma.follow.deleteMany({
        where: {
          userId: id,
          followId: idTarget,
        },
      });
      return new ResponseClass(
        null,
        HttpStatusCode.SUCCESS,
        'Unfollow user successfully',
      );
    } catch (error) {
      console.error(error);
    }
  }

  async checkFollowAndFriend(id: string, idTarget: string) {
    try {
      const follow = await this.prisma.follow.findFirst({
        where: {
          userId: id,
          followId: idTarget,
        },
      });
      const friend = await this.prisma.friend.findFirst({
        where: {
          OR: [
            {
              userId: id,
              friendId: idTarget,
            },
            {
              userId: idTarget,
              friendId: id,
            },
          ],
        },
        select: {
          status: true,
        },
      });
      return new ResponseClass(
        { follow: follow ? true : false, friend: friend ? friend : false },
        HttpStatusCode.SUCCESS,
        'Check follow and friend successfully',
      );
    } catch (error) {
      console.error(error);
    }
  }

  async unFriend(id: string, idTarget: string) {
    try {
      const friend = await this.prisma.friend.findFirst({
        where: {
          OR: [
            {
              userId: id,
              friendId: idTarget,
            },
            {
              userId: idTarget,
              friendId: id,
            },
          ],
        },
      });
      if (!friend) {
        throw new NotFoundException('Friend not found');
      }
      await this.prisma.friend.delete({
        where: {
          id: friend.id,
        },
      });
      return new ResponseClass(
        null,
        HttpStatusCode.SUCCESS,
        'Unfriend successfully',
      );
    } catch (error) {
      console.error(error);
    }
  }
}
