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
}
