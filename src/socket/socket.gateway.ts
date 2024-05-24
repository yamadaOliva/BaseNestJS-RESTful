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

  async afterInit(server: Server) {
    console.log(server);
    //Do stuffs
  }

  async handleDisconnect(client: Socket) {
    //Do stuffs
  }

  async handleConnection(client: Socket) {
    console.log(`Connected ${client.id}`);
    //Do stuffs
  }
  @SubscribeMessage('message')
  async handleMessage(
    client: Socket,
    payload: { userID: string; message: string; sourceID: string },
  ) {
    console.log(payload);
    console.log(payload?.userID);
    const roomName = 'user_' + payload.userID;
    this.server.to(roomName).emit('message', payload.message);
    this.chatService.createMessage(
      payload?.sourceID,
      payload.userID,
      payload.message,
    );
  }
  async sendMessageToAll(message: string) {
    this.server.emit('message', message);
  }
  async sendMessageToUser(userId: string, message: string) {
    this.server.to(userId).emit('message', message);
  }
  @SubscribeMessage('join')
  async handleJoinRoom(client: Socket, room: string) {
    console.log(`Joining room: ${room}`);
    client.join(room);
    client.emit('joined', room);
  }

  @SubscribeMessage('addFriend')
  async handleFriendRequest(
    client: Socket,
    payload: { friendId: string; message: string },
  ) {
    const roomName = 'user_' + payload.friendId;
    console.log('addFriend', payload);
    console.log('addFriend', payload.friendId);
    this.server.to(roomName).emit('notificationFriend', payload);
  }
}
