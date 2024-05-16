import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseClass } from 'src/global';
import { postDTO } from './postDTO';
@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  async createPost(data: postDTO) {
    try {
      await this.prisma.post.create({
        data: {
          ...data,
        },
      });
      return new ResponseClass({}, 200, 'Post created successfully');
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
        id: id,
      },
    });
  }

  async updatePost(id: string, data: any) {
    return await this.prisma.post.update({
      where: {
        id: id,
      },
      data: {
        ...data,
      },
    });
  }

  async deletePost(id: string) {
    return await this.prisma.post.delete({
      where: {
        id: id,
      },
    });
  }

  async getPostByUserId(userId: string) {
    try {
      const posts = await this.prisma.post.findMany({
        where: {
          userId: userId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return new ResponseClass(posts, 200, 'Post fetched successfully');
    } catch (error) {
      console.log(error);
    }
  }
}
