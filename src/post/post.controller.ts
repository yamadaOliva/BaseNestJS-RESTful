import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PostService } from './post.service';
import { JwtGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorator';
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}
  @UseGuards(JwtGuard)
  @Post('/create')
  async createPost(@GetUser() user, @Body() data) {
    return await this.postService.createPost({
      ...data,
      userId: user.user.id,
    });
  }

  @Get('/get/user/:id')
  async getPosts(@Param('id') id: string) {
    console.log(id);
    return await this.postService.getPostByUserId(id);
  }

  @UseGuards(JwtGuard)
  @Post('/like')
  async likePost(@GetUser() user, @Body('postId') postId: string) {
    return await this.postService.likePost(user.user.id, postId);
  }

  @UseGuards(JwtGuard)
  @Delete('/unlike/:postId')
  async unlikePost(@GetUser() user, @Param('postId') postId: string) {
    return await this.postService.unlikePost(user.user.id, postId);
  }

  @UseGuards(JwtGuard)
  @Get('/get/:id')
  async getPostById(@Param('id') id: string) {
    return await this.postService.getPostById(id);
  }

  @UseGuards(JwtGuard)
  @Post('/comment')
  async commentOnPost(@GetUser() user, @Body() data) {
    return await this.postService.createComment(
      user.user.id,
      data.postId,
      data.content,
    );
  }

  @UseGuards(JwtGuard)
  @Post('/comment/like')
  async likeComment(@GetUser() user, @Body() data) {
    return await this.postService.likeComment(user.user.id, data.commentId);
  }

  @UseGuards(JwtGuard)
  @Delete('/comment/unlike/:commentId')
  async unlikeComment(@GetUser() user, @Param('commentId') commentId: string) {
    return await this.postService.unlikeComment(user.user.id, commentId);
  }
}
