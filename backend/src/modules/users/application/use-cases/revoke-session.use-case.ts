import { Inject, Injectable } from "@nestjs/common";
import { IRevokeSessionUseCase } from "../interfaces/security-management.use-case.interface";
import { IUserSessionService, USER_SESSION_SERVICE } from "../../domain/interfaces/user-session.interface";
import { RevokeSessionDto } from "../dtos/security-management.dto";

@Injectable()
export class RevokeSessionUseCase implements IRevokeSessionUseCase {
    constructor(
        @Inject(USER_SESSION_SERVICE) private readonly _sessionService: IUserSessionService,
    ) {}

    async execute(userId: string, dto: RevokeSessionDto): Promise<void> {
        await this._sessionService.revokeSession(userId, dto.sessionId);
    }
}