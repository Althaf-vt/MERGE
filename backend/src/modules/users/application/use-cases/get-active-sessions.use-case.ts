import { Inject, Injectable } from "@nestjs/common";
import { IUserSessionService, USER_SESSION_SERVICE, UserSessionData } from "../../../../shared/domain/interfaces/user-session.interface";
import { IGetActiveSessionsUseCase } from "../interfaces/security-management.use-case.interface";

@Injectable()
export class GetActiveSessionsUseCase implements IGetActiveSessionsUseCase {
    constructor(
        @Inject(USER_SESSION_SERVICE) private readonly _sessionService: IUserSessionService,
    ) {}

    async execute(userId: string, currentSessionId: string): Promise<UserSessionData[]> {
        const sessions = await this._sessionService.getSessions(userId);
        
        // Map the sessions to identify the active one before passing to the presentation layer
        return sessions.map(session => ({
            ...session,
            isCurrentSession: session.sessionId === currentSessionId
        }));
    }
}