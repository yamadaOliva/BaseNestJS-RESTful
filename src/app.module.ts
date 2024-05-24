import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { NoteModule } from './note/note.module';
import { GroupModule } from './group/group.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { MajorsModule } from './majors/majors.module';
import { SocketModule } from './socket/socket.module';
import { FriendModule } from './friend/friend.module';
import { PostModule } from './post/post.module';
import { ChatModule } from './chat/chat.module';
import { NotificationModule } from './notification/notification.module';
@Module({
  imports: [
    AuthModule,
    UserModule,
    NoteModule,
    GroupModule,
    PrismaModule,
    ConfigModule,
    MajorsModule,
    SocketModule,
    FriendModule,
    PostModule,
    ChatModule,
    NotificationModule,
  ],
})
export class AppModule {}
