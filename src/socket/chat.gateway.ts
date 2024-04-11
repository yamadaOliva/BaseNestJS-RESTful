import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
//running port 80, cors
@WebSocketGateway(8001, {
  cors: '*',
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor() {}

  @WebSocketServer() server: Server;

  async afterInit(server: Server) {
    console.log(server);
    //Do stuffs
  }

  async handleDisconnect(client: Socket) {
    console.log(`Disconnected: ${client.id}`);
    //Do stuffs
  }

  async handleConnection(client: Socket) {
    console.log(`Connected ${client.id}`);
    //Do stuffs
  }
  @SubscribeMessage('message')
  async handleMessage(
    client: Socket,
    payload: { userID: string; message: string },
  ) {
    console.log(payload);
    console.log(payload?.userID);
    const roomName = "user_" + payload.userID;
    console.log(`Sending message to room: ${roomName}`);
    this.server.to(roomName).emit('message', payload.message);
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
}
