import { Body, Controller, Post, Put, UseGuards } from '@nestjs/common';
import { FriendService } from './friend.service';
import { JwtGuard } from 'src/auth/guard';
@Controller('friend')
export class FriendController {
    constructor(private readonly friendService: FriendService) {}
    @UseGuards(JwtGuard)
    @Post('/add')
    async addFriend(@Body('idSource') idSource: string, @Body('idTarget') idTarget: string) {
        console.log(idSource, idTarget);
        return await this.friendService.addFriend(idSource, idTarget);
    }

    @UseGuards(JwtGuard)
    @Put('/accept/')
    async acceptFriend(@Body('idRequest') idRequest: number) {
        return await this.friendService.acceptFriend(idRequest);
    }
}
