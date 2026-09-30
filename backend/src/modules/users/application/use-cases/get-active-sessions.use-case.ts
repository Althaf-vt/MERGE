import { Inject, Injectable } from "@nestjs/common";
import { IUserSessionService, USER_SESSION_SERVICE, UserSessionData } from "../../domain/interfaces/user-session.interface";
import { IGetActiveSessionsUseCase } from "../interfaces/security-management.use-case.interface";

@Injectable()
export class GetActiveSessionsUseCase implements IGetActiveSessionsUseCase {
    constructor(
        @Inject(USER_SESSION_SERVICE) private readonly _sessionService: IUserSessionService,
    ) {}

    async execute(userId: string): Promise<UserSessionData[]> {
        // Direct delegation to the Infrastructure Redis service
        return await this._sessionService.getSessions(userId);
    }
}