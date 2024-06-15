import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { HttpStatusCode } from '../global/globalEnum';
import { ResponseClass } from '../global';
@Injectable()
export class GroupService {
  constructor(private prisma: PrismaService) {}

  async createGroup(userId, name) {
    try {
      const checkNameExists = await this.prisma.group.findFirst({
        where: {
          name: name,
        },
      });
      if (checkNameExists) {
        return new ResponseClass(null, HttpStatusCode.ERROR, 'Nhóm đã tồn tại');
      }
      const group = await this.prisma.group.create({
        data: {
          name: name,
          OwnerId: userId,
        },
      });
      const member = await this.prisma.groupMember.create({
        data: {
          userId: userId,
          groupId: group.id,
          status: 'ACCEPTED',
        },
      });
      return new ResponseClass(
        group,
        HttpStatusCode.SUCCESS,
        'Group created successfully',
      );
    } catch (error) {
      console.log(error);
    }
  }

  async requestToJoinGroup(userId, groupId) {
    const group = await this.prisma.group.findUnique({
      where: {
        id: groupId,
      },
    });
    if (!group) {
      return new ResponseClass(null, HttpStatusCode.ERROR, 'Group not found');
    }
    const request = await this.prisma.groupMember.create({
      data: {
        userId: userId,
        groupId: groupId,
        status: 'PENDING',
      },
    });

    // notification
    const notification = await this.prisma.notification.create({
      data: {
        userId: group.OwnerId,
        sourceAvatarUrl: 'https://i.imgur.com/8H9M7Zt.png',
        content: 'Bạn có một yêu cầu tham gia nhóm ' + group.name,
        type: 'GROUP',
        meta: group.id,
      },
    });
    return new ResponseClass(
      request,
      HttpStatusCode.SUCCESS,
      'Request sent successfully',
    );
  }

  async acceptRequest(requestId) {
    const request = await this.prisma.groupMember.update({
      where: {
        id: requestId,
      },
      data: {
        status: 'ACCEPTED',
      },
      include: {
        user: true,
      },
    });

    const group = await this.prisma.group.findUnique({
      where: {
        id: request.groupId,
      },
    });
    const notification = await this.prisma.notification.create({
      data: {
        userId: request.userId,
        sourceAvatarUrl: request.user.avatarUrl,
        content: 'Bạn đã được chấp nhận vào nhóm ' + group.name,
        type: 'GROUP',
        meta: group.id,
      },
    });
    return new ResponseClass(
      notification,
      HttpStatusCode.SUCCESS,
      'Request accepted successfully',
    );
  }

  async rejectRequest(requestId) {
    // delete the request
    await this.prisma.groupMember.delete({
      where: {
        id: requestId,
      },
    });
    return new ResponseClass(
      null,
      HttpStatusCode.SUCCESS,
      'Request rejected successfully',
    );
  }

  async getGroupMembers(groupId) {
    const members = await this.prisma.groupMember.findMany({
      where: {
        groupId: groupId,
      },
      include: {
        user: true,
        group: {
          include: {
            owner: true,
          },
        },
      },
    });
    return new ResponseClass(
      members,
      HttpStatusCode.SUCCESS,
      'Group members fetched successfully',
    );
  }

  async getGroups(userId) {
    const groupMembers = await this.prisma.groupMember.findMany({
      where: {
        userId: userId,
        status: 'ACCEPTED',
      },
      include: {
        group: true,
      },
    });

    const groupsWithMemberCount = await Promise.all(
      groupMembers.map(async (groupMember) => {
        const memberCount = await this.prisma.groupMember.count({
          where: {
            groupId: groupMember.groupId,
            status: 'ACCEPTED',
          },
        });

        return {
          ...groupMember.group,
          memberCount,
        };
      }),
    );

    return new ResponseClass(
      groupsWithMemberCount,
      HttpStatusCode.SUCCESS,
      'Groups fetched successfully',
    );
  }

  async deleteMember(userId, groupId, memberId) {
    const group = await this.prisma.group.findUnique({
      where: {
        id: groupId,
      },
    });
    if (!group) {
      return new ResponseClass(null, HttpStatusCode.ERROR, 'Group not found');
    }
    if (group.OwnerId !== userId) {
      return new ResponseClass(
        null,
        HttpStatusCode.ERROR,
        'You are not the owner of this group',
      );
    }
    const request = await this.prisma.groupMember.findUnique({
      where: {
        id: memberId,
      },
    });

    if (!request) {
      return new ResponseClass(null, HttpStatusCode.ERROR, 'Member not found');
    }
    await this.prisma.groupMember.delete({
      where: {
        id: memberId,
      },
    });
    return new ResponseClass(
      null,
      HttpStatusCode.SUCCESS,
      'Member deleted successfully',
    );
  }

  async findGroupByName(name) {
    const group = await this.prisma.group.findMany({
      where: {
        name: {
          contains: name,
          mode: 'insensitive',
        },
      },
    });
    return new ResponseClass(
      group,
      HttpStatusCode.SUCCESS,
      'Group fetched successfully',
    );
  }

  async getMyGroups(userId) {
    const groups = await this.prisma.groupMember.findMany({
      where: {
        userId: userId,
      },
      include: {
        group: true,
      },
    });
    return new ResponseClass(
      groups,
      HttpStatusCode.SUCCESS,
      'Groups fetched successfully',
    );
  }

  async recommendGroup(userId) {
    const groups = await this.prisma.group.findMany({
      where: {
        NOT: {
          members: {
            some: {
              userId: userId,
            },
          },
        },
      },
      include: {
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    const groupWithMemberCount = groups.map((group) => ({
      ...group,
      memberCount: group._count.members,
    }));

    return new ResponseClass(
      groupWithMemberCount,
      HttpStatusCode.SUCCESS,
      'Recommended groups fetched successfully',
    );
  }
  async leaveGroup(userId, groupId) {
    const group = await this.prisma.group.findUnique({
      where: {
        id: groupId,
      },
    });
    if (!group) {
      return new ResponseClass(null, HttpStatusCode.ERROR, 'Group not found');
    }
    await this.prisma.groupMember.deleteMany({
      where: {
        userId: userId,
        groupId: groupId,
      },
    });
    return new ResponseClass(
      null,
      HttpStatusCode.SUCCESS,
      'Left group successfully',
    );
  }

  async findGroupById(groupId) {
    //count members and data
    const group = await this.prisma.group.findUnique({
      where: {
        id: groupId,
      },

      include: {
        owner: true,
        members: {
          where: {
            status: 'ACCEPTED',
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
                studentId: true,
                class: true,
              },
            },
          },
        },
      },
    });
    return new ResponseClass(
      group,
      HttpStatusCode.SUCCESS,
      'Group fetched successfully',
    );
  }

  async getRequestList(groupId) {
    const requests = await this.prisma.groupMember.findMany({
      where: {
        groupId: groupId,
        status: 'PENDING',
      },
      include: {
        user: true,
      },
    });
    return new ResponseClass(
      requests,
      HttpStatusCode.SUCCESS,
      'Requests fetched successfully',
    );
  }
}
