import { Inject } from "@nestjs/common";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { type IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { type ITokenservice, TOKEN_SERVICE } from "../../../../shared/domain/interfaces/token-service.interface";
import { RefreshTokenDto } from "../dtos/refresh-token.dto";
import { UserStatus } from "../../domain/enums/user.enums";
import { USER_ERROR_MESSAGES } from "../../domain/constants/user-error-messages.constant";
import { IRefreshTokenUseCase, RefreshTokenResponse } from "../interfaces/refresh-token.use-case.interface";
import { IUserSessionService, USER_SESSION_SERVICE } from "../../../../shared/domain/interfaces/user-session.interface";
import { UserResponseMapper } from "../mappers/user-response.mapper";


export class RefreshTokenUseCase implements IRefreshTokenUseCase {
    constructor(
        @Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository,
        @Inject(TOKEN_SERVICE) private readonly _tokenService: ITokenservice,
        @Inject(USER_SESSION_SERVICE) private readonly _sessionService: IUserSessionService,
    ) { };

    async execute(paylod: RefreshTokenDto): Promise<RefreshTokenResponse> {
        // 1. Validate signature and expiration using the infrastructure service
        const payload = this._tokenService.verifyRefreshToken(paylod.refreshToken);
        if (!payload) {
            throw new DomainException(ErrorCode.TOKEN_INVALID, USER_ERROR_MESSAGES.INVALID_REFRESH_TOKEN);
        }

        // Check if the session was remotely revoked in Redis
        if (!payload.sessionId) {
            throw new DomainException(ErrorCode.UNAUTHORIZED, USER_ERROR_MESSAGES.SESSION_ID_MISSING);
        }

        const isSessionValid = await this._sessionService.validateSession(payload.userId, payload.sessionId);
        if (!isSessionValid) {
            throw new DomainException(ErrorCode.UNAUTHORIZED, USER_ERROR_MESSAGES.SESSION_EXPIRED_OR_REVOKED);
        }

        const user = await this._userRepository.findById(payload.userId);
        if (!user || user.accountStatus !== UserStatus.ACTIVE) {
            throw new DomainException(ErrorCode.INVALID_CREDENTIALS, USER_ERROR_MESSAGES.ACCOUNT_INACTIVE_OR_DELETED);
        }

        const newPayload = {
            userId: user.id!,
            email: user.email.getValue(),
            role: "USER",
            sessionId: payload.sessionId,
        }

        return {
            accessToken: this._tokenService.generateAccessToken(newPayload),
            refreshToken: this._tokenService.generateRefreshToken(newPayload),
            user: UserResponseMapper.toResponse(user),
        };
    }
}