import { Inject, Injectable } from "@nestjs/common";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import type { IUserRepository } from "../../domain/interfaces/user-repository.interface";
import { PASSWORD_HASHER } from "../../../../shared/domain/interfaces/password-hasher.interface";
import type { IPasswordHasher } from "../../../../shared/domain/interfaces/password-hasher.interface";
import { LoginUserDto } from "../dtos/login-user.dto";
import { UserAggregate } from "../../domain/entities/user.entity";
import { TOKEN_SERVICE } from "../../../../shared/domain/interfaces/token-service.interface";
import type { ITokenservice } from "../../../../shared/domain/interfaces/token-service.interface";
import { ILoginUserUseCase, LoginUserResponse } from "../interfaces/login-user.use-case.interface";
import { IUserSessionService, USER_SESSION_SERVICE } from "../../../../shared/domain/interfaces/user-session.interface";
import { IUserAppConfig, USER_APP_CONFIG } from "../interfaces/user-app-config.interface";
import { UserResponseMapper } from "../mappers/user-response.mapper";
import { USER_ERROR_MESSAGES } from "../../domain/constants/user-error-messages.constant";
import { AuthProvider } from "../../domain/enums/user.enums";

@Injectable()
export class LoginUserUseCase implements ILoginUserUseCase {
    constructor(
        @Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository,
        @Inject(PASSWORD_HASHER) private readonly _passwordHasher: IPasswordHasher,
        @Inject(TOKEN_SERVICE) private readonly _tokenService: ITokenservice,
        @Inject(USER_SESSION_SERVICE) private readonly _sessionService: IUserSessionService,
        @Inject(USER_APP_CONFIG) private readonly _config: IUserAppConfig,
    ) { }

    async execute(dto: LoginUserDto, deviceInfo: string, ipAddress: string): Promise<LoginUserResponse> {
        const user = await this._userRepository.findByEmail(dto.email);

        if (!user) throw new DomainException(ErrorCode.USER_NOT_FOUND, USER_ERROR_MESSAGES.USER_NOT_EXISTS_REGISTER);

        if (user.authProvider === AuthProvider.GOOGLE) {
            throw new DomainException(ErrorCode.INVALID_CREDENTIALS, USER_ERROR_MESSAGES.SOCIAL_LOGIN_GOOGLE);
        }

        if (!user.passwordHash) {
            throw new DomainException(ErrorCode.INVALID_CREDENTIALS, USER_ERROR_MESSAGES.INVALID_CREDENTIALS);
        }

        const isPasswordValid = await this._passwordHasher.compare(dto.password, user.passwordHash!);
        if (!isPasswordValid) throw new DomainException(ErrorCode.INVALID_CREDENTIALS, USER_ERROR_MESSAGES.INVALID_CREDENTIALS);
        if (!user.isEmailVerified) throw new DomainException(ErrorCode.EMAIL_NOT_VERIFIED, USER_ERROR_MESSAGES.EMAIL_NOT_VERIFIED_LOGIN);

        user.recordLogin();
        await this._userRepository.update(user);

        const ttlSeconds = this._config.sessionTtlSeconds;
        const sessionId = await this._sessionService.createSession(user.id!, deviceInfo, ipAddress, ttlSeconds);
        
        const payload = {
            userId: user.id!,
            email: user.email.getValue(),
            role: 'USER',
            sessionId
        }

        return {
            accessToken: this._tokenService.generateAccessToken(payload),
            refreshToken: this._tokenService.generateRefreshToken(payload),
            user: UserResponseMapper.toResponse(user),
        };
    }
}