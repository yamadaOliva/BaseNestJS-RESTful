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
    //Do stuffs
  }

  async handleDisconnect(client: Socket) {
    //Do stuffs
  }

  async handleConnection(client: Socket) {
    //Do stuffs
  }
  @SubscribeMessage('message')
  async handleMessage(
    client: Socket,
    payload: { userID: string; message: string; sourceID: string },
  ) {
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
    client.join(room);
    client.emit('joined', room);
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
