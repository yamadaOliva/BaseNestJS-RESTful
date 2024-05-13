import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { PostService } from './post.service';
import { JwtGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorator';
@Controller('post')
export class PostController {
    constructor(private readonly postService: PostService) {}
    @UseGuards(JwtGuard)
    @Post('/create')
    async createPost(@GetUser() user,@Body() data) {
        return await this.postService.createPost({
            ...data,
            userId: user.user.id
        });
    }
    
    @UseGuards(JwtGuard)
    @Get('/get')
    async getPosts(@GetUser() user) {
        return await this.postService.getPostByUserId(user.user.id);
    }
}
