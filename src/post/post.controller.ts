import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
  ParseIntPipe,
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

  @Get('/get/user/:id/:page/:limit')
  async getPosts(
    @Param('id') id: string,
    @Param('page', ParseIntPipe) page: number,
    @Param('limit', ParseIntPipe) limit: number,
  ) {
    console.log(id);
    return await this.postService.getPostByUserId(id, page, limit);
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
    console.log(data);
    return await this.postService.likeComment(user.user.id, data.commentId);
  }

  @UseGuards(JwtGuard)
  @Delete('/comment/unlike/:commentId')
  async unlikeComment(@GetUser() user, @Param('commentId') commentId: string) {
    return await this.postService.unlikeComment(user.user.id, commentId);
  }

  @UseGuards(JwtGuard)
  @Post('/comment/reply')
  async replyComment(@GetUser() user, @Body() data) {
    return await this.postService.replyComment(
      user.user.id,
      data.commentId,
      data.content,
    );
  }

  @UseGuards(JwtGuard)
  @Post('/group')
  async createGroupPost(@GetUser() user, @Body() data) {
    return await this.postService.createGroupPost({
      ...data,
      userId: user.user.id,
    });
  }

  @UseGuards(JwtGuard)
  @Get('/group/:id')
  async getGroupPosts(@Param('id') id: string) {
    return await this.postService.getPostByGroupId(id);
  }

  @UseGuards(JwtGuard)
  @Get('following/:page/:limit')
  async getFollowingPosts(
    @GetUser() user,
    @Param('page', ParseIntPipe) page: number,
    @Param('limit', ParseIntPipe) limit: number,
  ) {
    return await this.postService.getLatestPostsByUserId(
      user.user.id,
      page,
      limit,
    );
  }

  @UseGuards(JwtGuard)
  @Delete('/delete/:id')
  async deletePost(@Param('id') id: string) {
    return await this.postService.deletePost(id);
  }

  @UseGuards(JwtGuard)
  @Delete('/comment/delete/:id')
  async deleteComment(@Param('id') id: string) {
    return await this.postService.deleteComment(id);
  }

  @UseGuards(JwtGuard)
  @Delete('/comment/admin/delete/:id')
  async deleteCommentByAdmin(@Param('id') id: string) {
    return await this.postService.deleteCommentAdmin(id);
  }

  @UseGuards(JwtGuard)
  @Delete('admin/delete/:id')
  async deletePostByAdmin(@Param('id') id: string) {
    return await this.postService.deletePostAdmin(id);
  }
}
