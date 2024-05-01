import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseClass } from 'src/global';
import { postDTO } from './postDTO';
@Injectable()
export class PostService {
    constructor(private prisma: PrismaService) {}
    
    async createPost(data: postDTO) {
        console.log("pepepe",data);
        try {
            await this.prisma.post.create({
                data: {
                    ...data
                }
            });
            return new ResponseClass({},200, 'Post created successfully')
        } catch (error) {
            console.log(error);
        }
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
