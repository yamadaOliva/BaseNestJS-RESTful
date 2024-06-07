// app.module.ts
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { NoteModule } from './note/note.module';
import { GroupModule } from './group/group.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MajorsModule } from './majors/majors.module';
import { SocketModule } from './socket/socket.module';
import { FriendModule } from './friend/friend.module';
import { PostModule } from './post/post.module';
import { ChatModule } from './chat/chat.module';
import { NotificationModule } from './notification/notification.module';
import { HandlebarsAdapter, MailerModule } from '@nest-modules/mailer';
import { join } from 'path';

@Module({
  imports: [
    AuthModule,
    UserModule,
    NoteModule,
    GroupModule,
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MajorsModule,
    SocketModule,
    FriendModule,
    PostModule,
    ChatModule,
    NotificationModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        transport: {
          host: config.get('MAIL_HOST'),
          secure: false,
          auth: {
            user: config.get('MAIL_USER'),
            pass: config.get('MAIL_PASSWORD'),
          },
        },
        defaults: {
          from: `"No Reply" <${config.get('MAIL_FROM')}>`,
        },
        template: {
          dir: join(__dirname, 'templates/email'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
  