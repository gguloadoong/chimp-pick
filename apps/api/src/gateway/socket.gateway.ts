import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

export interface PriceUpdatePayload {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',')
      : ['http://localhost:3001', 'http://localhost:3000'],
  },
  transports: ['websocket', 'polling'],
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(SocketGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe:symbol')
  handleSubscribe(
    @MessageBody() data: { symbol: string },
    @ConnectedSocket() client: Socket,
  ) {
    void client.join(`symbol:${data.symbol}`);
    this.logger.debug(`${client.id} subscribed to ${data.symbol}`);
  }

  @SubscribeMessage('unsubscribe:symbol')
  handleUnsubscribe(
    @MessageBody() data: { symbol: string },
    @ConnectedSocket() client: Socket,
  ) {
    void client.leave(`symbol:${data.symbol}`);
    this.logger.debug(`${client.id} unsubscribed from ${data.symbol}`);
  }

  broadcastPrice(payload: PriceUpdatePayload) {
    this.server.emit('price:tick', payload);
  }
}
