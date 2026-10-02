import { Inject, Injectable } from "@nestjs/common";
import { IRevokeOtherSessionsUseCase } from "../interfaces/security-management.use-case.interface";
import { IUserSessionService, USER_SESSION_SERVICE } from "../../../../shared/domain/interfaces/user-session.interface";

@Injectable()
export class RevokeOtherSessionsUseCase implements IRevokeOtherSessionsUseCase {
    constructor(
        @Inject(USER_SESSION_SERVICE) private readonly _sessionService: IUserSessionService,
    ) {}

    async execute(userId: string, currentSessionId: string): Promise<void> {
        await this._sessionService.revokeAllOtherSessions(userId, currentSessionId);
    }
}