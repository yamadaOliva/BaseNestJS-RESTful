import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseClass } from 'src/global';
import { postDTO, groupPostDTO } from './postDTO';
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
          group: true,
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
    try {
      await this.prisma.post.delete({
        where: {
          id: id,
        },
      });
      return new ResponseClass({}, 200, 'Post deleted successfully');
    } catch (error) {}
  }

  async getPostByUserId(userId: string, page: number, per_page: number) {
    try {
      const posts = await this.prisma.post.findMany({
        where: {
          userId: userId,
          type: 'PERSONAL',
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
        take: per_page,
        skip: (page - 1) * per_page,
      });
      return new ResponseClass(posts, 200, 'Post fetched successfully');
    } catch (error) {
      console.log(error);
    }
  }

  async likePost(userId: string, postId: string) {
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
      const post = await this.prisma.post.findUnique({
        where: {
          id: postId,
        },
      });

      const checkFriend = await this.prisma.friend.findFirst({
        where: {
          OR: [
            {
              userId: userId,
              friendId: post.userId,
              status: 'ACCEPTED',
            },
            {
              userId: post.userId,
              friendId: userId,
              status: 'ACCEPTED',
            },
          ],
        },
      });

      if (!checkFriend && post.type === 'PERSONAL' && post.userId !== userId) {
        return new ResponseClass(
          {},
          400,
          'Phải là bạn bè mới có thể bình luận',
        );
      }

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
              userId: true,
              type: true,
            },
          },
        },
      });
      const checkFriend = await this.prisma.friend.findFirst({
        where: {
          OR: [
            {
              userId: userId,
              friendId: comment.post.userId,
              status: 'ACCEPTED',
            },
            {
              userId: comment.post.userId,
              friendId: userId,
              status: 'ACCEPTED',
            },
          ],
        },
      });
      if (
        !checkFriend &&
        comment.post.type === 'PERSONAL' &&
        comment.post.userId !== userId
      ) {
        return new ResponseClass(
          {},
          400,
          'Phải là bạn bè mới có thể trả lời bình luận',
        );
      }

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

  async createGroupPost(data: groupPostDTO) {
    try {
      await this.prisma.post.create({
        data: {
          ...data,
          type: 'GROUP',
        },
      });
      return new ResponseClass({}, 200, 'Post created successfully');
    } catch (error) {
      console.log(error);
    }
  }

  async getPostByGroupId(groupId: string) {
    try {
      const posts = await this.prisma.post.findMany({
        where: {
          groupId: groupId,
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
          group: {
            select: {
              id: true,
              name: true,
              OwnerId: true,
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
  async getLatestPostsByUserId(userId: string, page: number, per_page: number) {
    try {
      const follows = await this.prisma.follow.findMany({
        where: {
          userId: userId,
        },
        select: {
          followId: true,
        },
      });

      const followingIds = follows.map((follow) => follow.followId);

      const groupMemberships = await this.prisma.groupMember.findMany({
        where: {
          userId: userId,
          status: 'ACCEPTED',
        },
        select: {
          groupId: true,
        },
      });

      const groupIds = groupMemberships.map((membership) => membership.groupId);

      const posts = await this.prisma.post.findMany({
        where: {
          OR: [
            {
              userId: {
                in: followingIds,
              },
              type: 'PERSONAL',
            },
            {
              groupId: {
                in: groupIds,
              },
              type: 'GROUP',
            },
          ],
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
          group: {
            select: {
              id: true,
              name: true,
              OwnerId: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: per_page,
        skip: (page - 1) * per_page,
      });

      return new ResponseClass(posts, 200, 'Posts fetched successfully');
    } catch (error) {
      console.error(error);
      throw new Error('Failed to fetch posts');
    }
  }

  async deleteComment(commentId: string) {
    try {
      await this.prisma.comment.deleteMany({
        where: {
          OR: [
            {
              id: commentId,
            },
            {
              fatherId: commentId,
            },
          ],
        },
      });
      return new ResponseClass({}, 200, 'Comment deleted successfully');
    } catch (error) {
      console.error(error);
      throw new Error('Failed to delete comment');
    }
  }

  async deletePostAdmin(postId: string) {
    try {
      const post = await this.prisma.post.findUnique({
        where: {
          id: postId,
        },
        include: {
          user: {
            select: {
              id: true,
            },
          },
        },
      });
      await this.prisma.post.delete({
        where: {
          id: postId,
        },
      });
      await this.prisma.notification.create({
        data: {
          userId: post.user.id,
          content: `Bài viết của bạn đã bị xóa do vi phạm chính sách`,
          type: 'FRIEND',
        },
      });
      return new ResponseClass({}, 200, 'Post deleted successfully');
    } catch (error) {
      console.error(error);
      throw new Error('Failed to delete post');
    }
  }

  async deleteCommentAdmin(commentId: string) {
    try {
      const comment = await this.prisma.comment.findUnique({
        where: {
          id: commentId,
        },
        include: {
          user: {
            select: {
              id: true,
            },
          },
        },
      });
      await this.prisma.comment.delete({
        where: {
          id: commentId,
        },
      });
      await this.prisma.notification.create({
        data: {
          userId: comment.user.id,
          content: `Bình luận của bạn đã bị xóa do vi phạm chính sách`,
          type: 'FRIEND',
        },
      });
      return new ResponseClass({}, 200, 'Comment deleted successfully');
    } catch (error) {
      console.error(error);
      throw new Error('Failed to delete comment');
    }
  }

}
