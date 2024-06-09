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
    try {
      const posts = await this.prisma.post.findMany({
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
    } catch (error) {}
  }

  async getPostById(id: string) {
    try {
      const post = await this.prisma.post.findUnique({
        where: {
          id: id,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
          comments: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  avatarUrl: true,
                },
              },
              likes: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      avatarUrl: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
          likes: {
            where: {
              commentId: null,
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
          },
        },
      });
      return new ResponseClass(post, 200, 'Post fetched successfully');
    } catch (error) {}
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
          comments: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  avatarUrl: true,
                },
              },
              likes: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      avatarUrl: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
          likes: {
            where: {
              commentId: null,
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

  async likePost(userId: string, postId: string) {
    console.log(userId, postId);
    try {
      const post = await this.prisma.post.findUnique({
        where: {
          id: postId,
        },
      });
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });
      await this.prisma.like.create({
        data: {
          userId: userId,
          postId: postId,
          commentId: null,
        },
      });
      console.log(post, user);
      if (post.userId !== userId) {
        await this.prisma.notification.create({
          data: {
            userId: post.userId,
            sourceAvatarUrl: user.avatarUrl,
            content: `${user.name} đã thích bài viết của bạn`,
            type: 'like',
            meta: post.id,
          },
        });
      }
      return new ResponseClass({}, 200, 'Post liked successfully');
    } catch (error) {
      console.log(error);
    }
  }

  async unlikePost(userId: string, postId: string) {
    try {
      const like = await this.prisma.like.findFirst({
        where: {
          userId: userId,
          postId: postId,
        },
      });
      if (!like) {
        return new ResponseClass({}, 400, 'Post not liked');
      }
      await this.prisma.like.delete({
        where: {
          id: like.id,
        },
      });
      return new ResponseClass({}, 200, 'Post unliked successfully');
    } catch (error) {
      console.log(error);
    }
  }

  async likeComment(userId: string, commentId: string) {
    try {
      const comment = await this.prisma.comment.findUnique({
        where: {
          id: commentId,
        },
      });
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });
      await this.prisma.like.create({
        data: {
          userId: userId,
          postId: comment.postId,
          commentId: commentId,
        },
      });
      if (comment.userId !== userId) {
        await this.prisma.notification.create({
          data: {
            userId: comment.userId,
            content: `${user.name} đã thích bình luận của bạn`,
            type: 'like',
            meta: comment.postId,
          },
        });
      }
      return new ResponseClass({}, 200, 'Comment liked successfully');
    } catch (error) {
      console.log(error);
    }
  }

  async unlikeComment(userId: string, commentId: string) {
    try {
      const like = await this.prisma.like.findFirst({
        where: {
          userId: userId,
          commentId: commentId,
        },
      });
      if (!like) {
        return new ResponseClass({}, 400, 'Comment not liked');
      }
      await this.prisma.like.delete({
        where: {
          id: like.id,
        },
      });
      return new ResponseClass({}, 200, 'Comment unliked successfully');
    } catch (error) {
      console.log(error);
    }
  }

  async createComment(userId: string, postId: string, content: string) {
    try {
      console.log(userId, postId, content);
      const post = await this.prisma.post.findUnique({
        where: {
          id: postId,
        },
      });
      console.log(post);
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });
      const comment = await this.prisma.comment.create({
        data: {
          content: content,
          userId: userId,
          postId: postId,
        },
      });
      if (post.userId !== userId) {
        await this.prisma.notification.create({
          data: {
            userId: post.userId,
            sourceAvatarUrl: user.avatarUrl,
            content: `${user.name} đã bình luận bài viết của bạn`,
            type: 'comment',
            meta: post.id,
          },
        });
      }

      return new ResponseClass(comment, 200, 'Comment created successfully');
    } catch (error) {
      console.log(error);
    }
  }

  async replyComment(userId: string, commentId: string, content: string) {
    try {
      const comment = await this.prisma.comment.findUnique({
        where: {
          id: commentId,
        },
        include: {
          post: {
            select: {
              id: true,
            },
          },
        },
      });
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });
      const reply = await this.prisma.comment.create({
        data: {
          content: content,
          userId: userId,
          fatherId: commentId,
          postId: comment.postId,
        },
      });
      // check not me
      if (comment.userId !== userId) {
        await this.prisma.notification.create({
          data: {
            userId: comment.userId,
            sourceAvatarUrl: user.avatarUrl,
            content: `${user.name} đã trả lời bình luận của bạn`,
            type: 'reply',
            meta: comment.postId,
          },
        });
      }

      //commented user

      return new ResponseClass(reply, 200, 'Reply created successfully');
    } catch (error) {
      console.log(error);
    }
  }
}
