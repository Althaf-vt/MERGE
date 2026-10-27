import { Inject, Injectable, Logger } from "@nestjs/common";
import { IAdminLogoutUseCase } from "../interfaces/admin-logout.use-case.interface";
import { type ITokenservice, TOKEN_SERVICE } from "../../../../shared/domain/interfaces/token-service.interface";
import { ADMIN_SESSION_SERVICE, type IAdminSessionService } from "../../domain/interfaces/admin-session.interface";

@Injectable()
export class AdminLogoutUseCase implements IAdminLogoutUseCase {
    private readonly _logger = new Logger(AdminLogoutUseCase.name);

    constructor(
        @Inject(TOKEN_SERVICE) private readonly _tokenService: ITokenservice,
        @Inject(ADMIN_SESSION_SERVICE) private readonly _sessionService: IAdminSessionService,
    ) { }

    async execute(token?: string): Promise<void> {
        if (!token) {
            return;
        }

        try {
            const payload = this._tokenService.verifyRefreshToken(token);
            if (payload && payload.userId) {
                await this._sessionService.deleteSession(payload.userId);
            }
        } catch (error) {
            this._logger.debug('Admin refresh token invalid during logout; proceeding with cookie cleanup.');
        }
    }
}