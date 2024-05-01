import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
@Injectable()
export class FriendService {
    constructor(private prisma: PrismaService) {}
    async addFriend(idSource:string, idTarget:string) {
        return await this.prisma.friend.create({
            data: {
                user: {
                    connect: {
                        id: idSource,
                    },
                },
                friend: {
                    connect: {
                        id: idTarget,
                    },
                },
            },
        });
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
        


}
