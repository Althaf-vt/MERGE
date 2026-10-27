import { Inject, Injectable, Logger } from "@nestjs/common";
import { ILogoutUseCase } from "../interfaces/logout.use-case.interface";
import { type ITokenservice, TOKEN_SERVICE } from "../../../../shared/domain/interfaces/token-service.interface";
import { type IUserSessionService, USER_SESSION_SERVICE } from "../../../../shared/domain/interfaces/user-session.interface";

@Injectable()
export class LogoutUseCase implements ILogoutUseCase {
    private readonly _logger = new Logger(LogoutUseCase.name);

    constructor(
        @Inject(TOKEN_SERVICE) private readonly _tokenService: ITokenservice,
        @Inject(USER_SESSION_SERVICE) private readonly _sessionService: IUserSessionService,
    ) { }

    async execute(refreshToken?: string): Promise<void> {
        if (!refreshToken) {
            return;
        }

        try {
            const payload = this._tokenService.verifyRefreshToken(refreshToken);
            if (payload && payload.userId && payload.sessionId) {
                await this._sessionService.revokeSession(payload.userId, payload.sessionId);
            }
        } catch (error) {
            this._logger.debug('Refresh token invalid during logout; proceeding with cookie cleanup.');
        }
    }
}
