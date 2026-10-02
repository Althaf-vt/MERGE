import { Inject, Injectable } from "@nestjs/common";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { IGoogleLoginResult, IGoogleLoginUseCase } from "../interfaces/google-login.use-case.interface";
import { OAuth2Client } from "google-auth-library";
import { IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { GoogleLoginDto } from "../dtos/google-login.dto";
import { EmailVO } from "../../../../shared/domain/value-objects/email.vo";
import { UserAggregate, UserRole } from "../../domain/entities/user.entity";
import { AuthProvider, UserStatus } from "../../domain/enums/user.enums";
import { ITokenservice, TOKEN_SERVICE } from "../../../../shared/domain/interfaces/token-service.interface";
import { IUserSessionService, USER_SESSION_SERVICE } from "../../../../shared/domain/interfaces/user-session.interface";

@Injectable()
export class GoogleLoginUseCase implements IGoogleLoginUseCase{
    private readonly _googleClient: OAuth2Client;

    constructor(
        @Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository,
        @Inject(TOKEN_SERVICE) private readonly _tokenService: ITokenservice,
        @Inject(USER_SESSION_SERVICE) private readonly _sessionService: IUserSessionService,
    ){
        this._googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    }

    async execute(dto: GoogleLoginDto, deviceInfo: string, ipAddress: string): Promise<IGoogleLoginResult> {
        let payload;

        try {
            const ticket = await this._googleClient.verifyIdToken({
                idToken: dto.idToken,
                audience: process.env.GOOGLE_CLIENT_ID
            })

            payload = ticket.getPayload();
        } catch (error: any) {
            throw new DomainException(ErrorCode.INVALID_CREDENTIALS, "Google token verification failed.");
        }

        if (!payload || !payload.email) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, "Invalid Google token payload.");
        }

        const emailVo = new EmailVO(payload.email);
        let user = await this._userRepository.findByEmail(emailVo.getValue());

        if (!user) {
            // Register new OAuth user (automatically verified by Google)
            user = new UserAggregate({
                email: emailVo,
                passwordHash: null,
                authProvider: AuthProvider.GOOGLE,
                isEmailVerified: true,
                accountStatus: UserStatus.ACTIVE,
                kycCompleted: false,
                onboardingStep: 2,
                onboardingCompleted: false,
                profileCompleted: false,
                castingDirectorCompleted: false,
                lumenEnabled: true,
                dailyMatchHours: [],
                lumenRecommendationGeneratedToday: 0,
                lastLumenReset: new Date(),
            });

            await this._userRepository.create(user);

            // Re-fetch to ensure the generated database ID is present
            const persistedUser = await this._userRepository.findByEmail(emailVo.getValue());
            if(persistedUser) user = persistedUser;
        }else{
            // STRICT DDD FIX: We removed the manual accountStatus check here.
            // We delegate entirely to the Domain Entity which automatically lifts suspensions,
            // triggers reactivations, or throws errors for banned/deleted states
            user.recordLogin();
            await this._userRepository.update(user);
        }

        if(!user.id){
            throw new DomainException(ErrorCode.INTERNAL_SERVER_ERROR, "User identification failed.");
        }

        const ttlSeconds = parseInt(process.env.JWT_REFRESH_EXPIRATION_SECONDS || '604800', 10);
        const sessionId = await this._sessionService.createSession(user.id!, deviceInfo, ipAddress, ttlSeconds);

        // Generate tokens
        const tokenPayload = {
            userId: user.id,
            email: user.email.getValue(),
            role: UserRole.USER,
            sessionId,
        };

        const accessToken = this._tokenService.generateAccessToken(tokenPayload);
        const refreshToken = this._tokenService.generateRefreshToken(tokenPayload);

        return {
            accessToken,
            refreshToken,
            user: user.toJSON()
        }
    }
}