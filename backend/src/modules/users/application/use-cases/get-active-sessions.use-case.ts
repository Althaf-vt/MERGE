import { Inject, Injectable } from "@nestjs/common";
import { IUserSessionService, USER_SESSION_SERVICE } from "../../../../shared/domain/interfaces/user-session.interface";
import { IGetActiveSessionsUseCase } from "../interfaces/security-management.use-case.interface";
import { ActiveSessionResponseDto } from "../dtos/security-management.dto";
import { UserSessionDtoMapper } from "../mappers/user-session-dto.mapper";

@Injectable()
export class GetActiveSessionsUseCase implements IGetActiveSessionsUseCase {
    constructor(
        @Inject(USER_SESSION_SERVICE) private readonly _sessionService: IUserSessionService,
    ) {}

    async execute(userId: string, currentSessionId: string): Promise<ActiveSessionResponseDto[]> {
        const sessions = await this._sessionService.getSessions(userId);
        return UserSessionDtoMapper.toResponseDtoList(sessions, currentSessionId);
    }
}
