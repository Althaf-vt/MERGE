import { Inject, Injectable } from "@nestjs/common";
import { ICancelHandoffSessionUseCase } from "../interfaces/cancel-handoff-session.use-case.interface";
import { HANDOFF_NOTIFICATION_SERVICE, type IHandoffNotificationService } from "../interfaces/handoff-notification.service.interface";
import { HANDOFF_SERVICE, type IHandoffSessionService } from "../interfaces/handoff-service.interface";
import { HandoffStatus } from "../../domain/enums/user.enums";

@Injectable()
export class CancelHandoffSessionUseCase implements ICancelHandoffSessionUseCase {
    constructor(
        @Inject(HANDOFF_NOTIFICATION_SERVICE) private readonly _handoffGateway: IHandoffNotificationService,
        @Inject(HANDOFF_SERVICE) private readonly _handoffService: IHandoffSessionService,
    ) { }

    async execute(sessionId: string): Promise<void> {
        this._handoffGateway.notifyDesktop(sessionId, HandoffStatus.CANCELLED);
        await this._handoffService.deleteSession(sessionId);
    }
}