import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChatDTO } from './chatDTO';
@Injectable()
export class ChatService {
    constructor(private prisma: PrismaService) {}
    async getChatByUserId(sourceId: string, targetId: string) {
        try {
            await this.prisma.messagePrivate.findMany({
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
                                    fromUserId :targetId
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
        } catch (error) {
            throw new ForbiddenException('Error');
        }
        
    }
    
    async createMessage(sourceId: string, targetId: string, message: string) {
        try {
            await this.prisma.messagePrivate.create({
                data: {
                    fromUserId: sourceId,
                    toUserId: targetId,
                    content: message
                },
            });
        } catch (error) {
            console.log(error);
        }
     
    }
}
