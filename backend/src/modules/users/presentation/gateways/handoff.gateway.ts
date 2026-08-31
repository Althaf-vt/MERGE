import { Injectable } from "@nestjs/common";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({cors: {origin: process.env.FRONTED_URL || 'http://localhost:5173', credentials: true}})
@Injectable()
export class HandoffGateway{
    @WebSocketServer()
    server: Server;

    // the desktop frontend calls this immediately after generating the QR code.
    // It locks the desktop socket into a private room matching the Redis sessionId.
    @SubscribeMessage('join-handoff-room')
    handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() sessionId: string){
        client.join(sessionId);
    }

    // A helper method for our HTTP Use Cases to call.
    // Pushes a status update (eg: 'PHONE CONNECTED', 'COMPLETED') directly to the desktop.
    notifyDesktop(sessionId: string, status: 'PHONE_CONNECTED' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED'){
        // .to(sessionId) ensures only the desktop waiting in this specific room gets the message
        this.server.to(sessionId).emit('handoff-status-update', {status});
    }
}