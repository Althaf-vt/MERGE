import { Inject, Injectable } from "@nestjs/common";
import { DomainException } from "../../domain/exceptions/domain.exception";
import { ErrorCode } from "../../domain/enums/error-code.enum";
import { IGoogleLoginResult, IGoogleLoginUseCase } from "../interfaces/google-login.use-case.interface";
import { OAuth2Client } from "google-auth-library";
import { IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { GoogleLoginDto } from "../dtos/google-login.dto";
import { EmailVO } from "../../domain/value-objects/email.vo";
import { UserAggregate, UserRole } from "../../domain/entities/user.entity";
import { AuthProvider, UserStatus } from "../../domain/enums/user.enums";
import { ITokenservice, TOKEN_SERVICE } from "../../domain/interfaces/token-service.interface";

@Injectable()
export class GoogleLoginUseCase implements IGoogleLoginUseCase{
    private readonly _googleClient: OAuth2Client;

    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: IUserRepository,
        @Inject(TOKEN_SERVICE)
        private readonly tokenService: ITokenservice
    ){
        this._googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    }

    async execute(dto: GoogleLoginDto): Promise<IGoogleLoginResult> {
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
        let user = await this.userRepository.findByEmail(emailVo.getValue());

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

            await this.userRepository.create(user);

            // Re-fetch to ensure the generated database ID is present
            const persistedUser = await this.userRepository.findByEmail(emailVo.getValue());
            if(persistedUser) user = persistedUser;
        }else{
            // Existing User login 
            if(user.accountStatus !== UserStatus.ACTIVE){
                throw new DomainException(ErrorCode.INVALID_CREDENTIALS, `Cannot login: account is ${user.accountStatus.toLowerCase()}.`)
            }

            user.recordLogin();
            await this.userRepository.update(user)
        }

        if(!user.id){
            throw new DomainException(ErrorCode.INTERNAL_SERVER_ERROR, "User identification failed.");
        }

        // Generate tokens
        const tokenPayload = {
            userId: user.id,
            email: user.email.getValue(),
            role: UserRole.USER
        };

        const accessToken = this.tokenService.generateAccessToken(tokenPayload);
        const refreshToken = this.tokenService.generateRefreshToken(tokenPayload);

        return {
            accessToken,
            refreshToken,
            user: user.toJSON()
        }
    }
}