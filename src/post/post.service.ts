import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
@Injectable()
export class PostService {
    constructor(private prisma: PrismaService) {}
    
    async createPost(data: any) {
        return await this.prisma.post.create({
            data: {
                ...data
            }
        });
    }

    async getPosts() {
        return await this.prisma.post.findMany();
    }

    async getPostById(id: string) {
        return await this.prisma.post.findUnique({
            where: {
                id: id
            }
        });
    }

    async updatePost(id: string, data: any) {
        return await this.prisma.post.update({
            where: {
                id: id
            },
            data: {
                ...data
            }
        });
    }

    async deletePost(id: string) {
        return await this.prisma.post.delete({
            where: {
                id: id
            }
        });
    }
}
