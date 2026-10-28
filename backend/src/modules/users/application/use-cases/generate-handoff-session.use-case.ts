import { Inject, Injectable } from "@nestjs/common";
import { HANDOFF_SERVICE, type IHandoffSessionService } from "../interfaces/handoff-service.interface";
import { GenerateHandoffResult, IGenerateHandoffSessionUseCase } from "../interfaces/generate-handoff-session.use-case.interface";
import { EnvConfig } from "../../../../shared/infrastructure/config/env.config";

@Injectable()
export class GenerateHandoffSessionUseCase implements IGenerateHandoffSessionUseCase {
    constructor(
        @Inject(HANDOFF_SERVICE) private readonly _handoffService: IHandoffSessionService,
    ) { }

    async execute(userId: string, clientOrigin?: string): Promise<GenerateHandoffResult> {
        const TTL_SECONDS = 300; // 5min

        // 1. Create the secure session in Redis
        const sessionId = await this._handoffService.createSession(userId, TTL_SECONDS);

        // 2. calculate the exact expiration timestamp for the frontend UI
        const expiresAt = new Date(Date.now() + TTL_SECONDS * 1000);

        // 3. construct the exact URL the mobile device needs to hit
        const baseUrl = clientOrigin || EnvConfig.app.frontendUrl;
        const qrCodeUrl = `${baseUrl}/handoff?token=${sessionId}`;

        return {
            sessionId,
            qrCodeUrl,
            expiresAt: expiresAt.toISOString(),
        };
    }
}