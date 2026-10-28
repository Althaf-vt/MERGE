import { Injectable, Logger } from "@nestjs/common";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { IHandoffNotificationService } from "../../application/interfaces/handoff-notification.service.interface";
import { EnvConfig } from "../../../../shared/infrastructure/config/env.config";
import { HandoffStatus } from "../../domain/enums/user.enums";
import { HANDOFF_SOCKET_EVENTS } from "../constants/handoff-events.constant";

@WebSocketGateway({ cors: { origin: EnvConfig.app.frontendUrl, credentials: true } })
@Injectable()
export class HandoffGateway implements IHandoffNotificationService {
    @WebSocketServer()
    server: Server;

    private readonly _logger = new Logger(HandoffGateway.name);

    // The desktop frontend calls this immediately after generating the QR code.
    // It locks the desktop socket into a private room matching the Redis sessionId.
    @SubscribeMessage(HANDOFF_SOCKET_EVENTS.JOIN_ROOM)
    handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() sessionId: string): void {
        client.join(sessionId);
    }

    // A helper method for HTTP Use Cases to push status updates directly to the desktop.
    notifyDesktop(sessionId: string, status: HandoffStatus): void {
        if (!this.server) {
            this._logger.warn(`Cannot emit handoff status update: WebSocket server is not initialized.`);
            return;
        }

        // .to(sessionId) ensures only the desktop waiting in this specific room gets the message
        this.server.to(sessionId).emit(HANDOFF_SOCKET_EVENTS.STATUS_UPDATE, { status });
    }
}
