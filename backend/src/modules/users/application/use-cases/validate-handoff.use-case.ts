import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { HANDOFF_SERVICE, type IHandoffSessionService } from "../interfaces/handoff-service.interface";
import { IValidateHandoffUseCase } from "../interfaces/validate-handoff.interface.use-case";
import { HANDOFF_NOTIFICATION_SERVICE, IHandoffNotificationService } from "../interfaces/handoff-notification.service.interface";

@Injectable()
export class ValidateHandoffUseCase implements IValidateHandoffUseCase {
    constructor(
        @Inject(HANDOFF_SERVICE) private readonly _handoffService: IHandoffSessionService,
        // Injecting the gateway so we can trigger real-time updates from this HTTP request
        // private readonly _handoffGateway: HandoffGateway,
        @Inject(HANDOFF_NOTIFICATION_SERVICE) private readonly _handoffGateway: IHandoffNotificationService,
    ) { };

    async execute(sessionId: string): Promise<string> {
        // 1. check if the QR code is still valid in Redis
        const userId = await this._handoffService.validateSession(sessionId);

        if (!userId) {
            throw new BadRequestException('QR Code session has expired or is invalid.');
        }

        // 2. Instantly notify the desktop UI that mobile phone has successfully connected
        this._handoffGateway.notifyDesktop(sessionId, 'PHONE_CONNECTED');

        // 3. Return the userId so the controller can issue authenticated cookies
        return userId;
    }
}