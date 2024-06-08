import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { ChatService } from 'src/chat/chat.service';
//running port 80, cors
@WebSocketGateway(8001, {
  cors: '*',
})
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly chatService: ChatService) {}

  @WebSocketServer() server: Server;

  async afterInit(server: Server) {}

  async handleDisconnect(client: Socket) {}

  async handleConnection(client: Socket) {}
  @SubscribeMessage('message')
  async handleMessage(
    client: Socket,
    data: {
      content: string;
      toUserId: string;
      fromUserId: string;
      imgUser: string;
    },
  ) {
    const roomName = 'user_' + data.toUserId;
    console.log('sdfsdf', data);
    this.server.to(roomName).emit('receive-message', data);
  }

  @SubscribeMessage('join')
  async handleJoinRoom(client: Socket, room: string) {
    client.join(room);
    client.emit('joined', room);
  }

  @SubscribeMessage('joinPost')
  async handleJoinPost(client: Socket, room: string) {
    client.join(room);
    console.log('room', room);
    client.emit('joinedPost', room);
  }

  @SubscribeMessage('comment')
  async handleComment(client: Socket, room: any) {
    console.log('comment', room);
    this.server.to(room).emit('comment', "refresh");
  }

  @SubscribeMessage('notification')
  async handleNotification(client: Socket, room: string) {
    console.log('notification', room);
    this.server.to(room).emit('notification', 'refresh');
  }

  @SubscribeMessage('addFriend')
  async handleFriendRequest(
    client: Socket,
    payload: { friendId: string; type: string },
  ) {
    const roomName = 'user_' + payload.friendId;
    this.server.to(roomName).emit('notificationFriend', payload);
  }
}
