import { Inject } from "@nestjs/common";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { type IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { type ITokenservice, TOKEN_SERVICE } from "../../../../shared/domain/interfaces/token-service.interface";
import { RefreshTokenDto } from "../dtos/refresh-token.dto";
import { UserStatus } from "../../domain/enums/user.enums";
import { IRefreshTokenUseCase } from "../interfaces/refresh-token.use-case.interface";
import { UserAggregate } from "../../domain/entities/user.entity";
import { IUserSessionService, USER_SESSION_SERVICE } from "../../../../shared/domain/interfaces/user-session.interface";


export class RefreshTokenUseCase implements IRefreshTokenUseCase {
    constructor(
        @Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository,
        @Inject(TOKEN_SERVICE) private readonly _tokenService: ITokenservice,
        @Inject(USER_SESSION_SERVICE) private readonly _sessionService: IUserSessionService,
    ) { };

    async execute(paylod: RefreshTokenDto): Promise<{ accessToken: string; refreshToken: string; user: UserAggregate; }> {
        // 1. Validate signature and expiration using the infrastructure service
        // If the token is invalid or expired, this throws an UnauthorizedException
        const payload = this._tokenService.verifyRefreshToken(paylod.refreshToken);

        // Check if the session was remotely revoked in Redis
        if (!payload.sessionId) {
            throw new DomainException(ErrorCode.UNAUTHORIZED, 'Invalid token payload: Session ID missing.');
        }

        const isSessionValid = await this._sessionService.validateSession(payload.userId, payload.sessionId);
        if (!isSessionValid) {
            throw new DomainException(ErrorCode.UNAUTHORIZED, 'Session has expired or was revoked remotely.');
        }

        const user = await this._userRepository.findById(payload.userId);
        if (!user || user.accountStatus !== UserStatus.ACTIVE) {
            throw new DomainException(ErrorCode.INVALID_CREDENTIALS, 'User account is inactive or deleted');
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
            user: user,
        };
    }
}