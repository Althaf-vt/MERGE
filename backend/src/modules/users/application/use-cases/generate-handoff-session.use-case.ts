import { Inject, Injectable } from "@nestjs/common";
import { HANDOFF_SERVICE, type IHandoffSessionService } from "../../domain/interfaces/handoff-service.interface";


@Injectable()
export class GenerateHandoffSessionUseCase{
    // we inject the Interface (token), not the specific Redis class.
    // This keeps the architecture clean and decoupled
    constructor(
        @Inject(HANDOFF_SERVICE) private readonly handoffService: IHandoffSessionService
    ){}

    async execute(userId: string){
        const TTL_SECONDS = 300 // 5min

        // 1. Create the secure session in Redis
        const sessionId = await this.handoffService.createSession(userId, TTL_SECONDS);

        // 2. calculate the exact expiration timestamp for the frontend UI
        const expiresAt = new Date(Date.now() + TTL_SECONDS * 1000);

        // 3. construct the exact URL the mobile device needs to hit
        const baseUrl = process.env.FRONTENT_URL || 'http://localhost:5173';
        const qrCodeUrl = `${baseUrl}/handoff?token=${sessionId}`;

        return {
            success: true,
            message: 'Phone handoff session created',
            data: {
                sessionId,
                qrCodeUrl,
                expiresAt: expiresAt.toISOString()
            }
        }
    }
}