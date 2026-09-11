import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "./infrastructure/persistence/user.schema";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./presentation/controllers/auth.controller";
import { BcryptService } from "../../shared/infrastructure/security/bcrypt.service";
import { RegisterUserUseCase } from "./application/use-cases/register-user.use-case";
import { VerifyOtpUseCase } from "./application/use-cases/verify-otp.use-case";
import { USER_REPOSITORY } from "./domain/interfaces/user-repository.interface";
import { JwtTokenService } from "./infrastructure/security/jwt-token.service";
import { TOKEN_SERVICE } from "./domain/interfaces/token-service.interface";
import { MongoUserRepository } from "./infrastructure/persistence/mongo-user.repository";
import { OTP_SERVICE } from "./domain/interfaces/otp-service.interface";
import { RedisOtpService } from "./infrastructure/services/redis-otp.service";
import { LoginUserUseCase } from "./application/use-cases/login-user.use-case";
import { RefreshTokenUseCase } from "./application/use-cases/refresh-token.use-case";
import { KycController } from "./presentation/controllers/kyc.controller";
import { SubmitKycDocumentUseCase } from "./application/use-cases/submit-kyc-document.use-case";
import { KYC_HASH_SERVICE, PKI_VERIFICATION_SERVICE } from "./domain/interfaces/kyc-service.interface";
import { KycHashService } from "./infrastructure/services/kyc-hash.service";
import { JwtAuthGuard } from "../../shared/infrastructure/security/jwt-auth.guard";
import { AadharPkiService } from "./infrastructure/services/aadhaar-pki.service";
import { HandoffController } from "./presentation/controllers/handoff.controller";
import { HandoffGateway } from "./presentation/gateways/handoff.gateway";
import { ValidateHandoffUseCase } from "./application/use-cases/validate-handoff.use-case";
import { GenerateHandoffSessionUseCase } from "./application/use-cases/generate-handoff-session.use-case";
import { HANDOFF_SERVICE } from "./application/interfaces/handoff-service.interface";
import { REDIS_CLIENT, RedisHandoffService } from "./infrastructure/services/redis-handoff.service";
import { HttpModule } from "@nestjs/axios";
import { SubmitLiveSelfieUseCase } from "./application/use-cases/submit-live-selfie.use-case";
import { BIOMETRIC_SERVICE } from "./domain/interfaces/biometric-service.interface";
import { HttpBiometricService } from "./infrastructure/services/http-biometric.service";
import { s3StorageService } from "./infrastructure/services/s3-storage.service";
import { SubmitLivenessCheckUseCase } from "./application/use-cases/submit-liveness-check.use-case";
import { SUBMIT_LIVENESS_CHECK_USE_CASE } from "./application/interfaces/submit-liveness-check.use-case.interface";
import { SUBMIT_FINAL_VERIFICATION_USE_CASE } from "./application/interfaces/submit-final-verification.use-case.interface";
import { SubmitFinalVerificationUseCase } from "./application/use-cases/submit-final-verification.use-case";
import { UpdatePersonaUseCase } from "./application/use-cases/update-persona.use-case";
import { ProfileController } from "./presentation/controllers/profile.controller";
import { UPDATE_PERSONA_USE_CASE } from "./application/interfaces/update-persona.use-case.interface";
import { UpdateLifeStyleUseCase } from "./application/use-cases/update-lifestyle.use-case";
import { UPDATE_LIFESTYLE_USE_CASE } from "./application/interfaces/update-lifestyle.use-case.interface";
import { UpdatePreferencesUseCase } from "./application/use-cases/update-preferences.use-case";
import { UPDATE_PREFERENCES_USE_CASE } from "./application/interfaces/update-preferences.use-case.interface";
import { GenerateBioUseCase } from "./application/use-cases/generate-bio.use-case";
import { SaveBioUseCase } from "./application/use-cases/save-bio.use-case";
import { AI_SERVICE } from "./domain/interfaces/ai-service.interface";
import { GENERATE_BIO_USE_CASE } from "./application/interfaces/generate-bio.use-case.interface";
import { SAVE_BIO_USE_CASE } from "./application/interfaces/save-bio.use-case.interface";
import { OpenRouterAiService } from "./infrastructure/services/openrouter-ai.service";
import { ResendOtpUseCase } from "./application/use-cases/resend-otp.use-case";
import { RESEND_OTP_USE_CASE } from "./application/interfaces/resend-otp.use-case.interface";
import { ForgotPasswordUseCase } from "./application/use-cases/forgot-password.use-case";
import { ResetPasswordUseCase } from "./application/use-cases/reset-password.use-case";
import { FORGOT_PASSWORD_USE_CASE, RESET_PASSWORD_USE_CASE } from "./application/interfaces/forgot-password.use-case.interface";
import { GoogleLoginUseCase } from "./application/use-cases/google-login.use-case";
import { GOOGLE_LOGIN_USE_CASE } from "./application/interfaces/google-login.use-case.interface";
import { GENERATE_HANDOFF_SESSION_USE_CASE } from "./application/interfaces/generate-handoff-session.use-case.interface";
import { LOGIN_USER_USE_CASE } from "./application/interfaces/login-user.use-case.interface";
import { REFRESH_TOKEN_USE_CASE } from "./application/interfaces/refresh-token.use-case.interface";
import { REGISTER_USER_USE_CASE } from "./application/interfaces/register-user.use-case.interface";
import { SUBMIT_KYC_DOCUMENT_USE_CASE } from "./application/interfaces/submit-kyc-document.use-case.interface";
import { SUBMIT_LIVE_SELFIE_USE_CASE } from "./application/interfaces/submit-live-selfie.use-case.interface";
import { VALIDATE_HANDOFF_USE_CASE } from "./application/interfaces/validate-handoff.interface.use-case";
import { VERIFY_OTP_USE_CASE } from "./application/interfaces/verify-otp.use-case.interface";
import { HANDOFF_NOTIFICATION_SERVICE } from "./application/interfaces/handoff-notification.service.interface";
import { STORAGE_SERVICE } from "./application/interfaces/storage-service.interface";
import Redis from "ioredis";


// Defines the User module and wires together its controllers, use cases,
// Services, repository implementations, and external dependencies.
@Module({
    imports:[
        // Registers the User schema with Mongoose for database operations.
        MongooseModule.forFeature([{name: User.name, schema: UserSchema}]),

        // Configures JWT support for token generation and verification.
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'super-secret-fallback',
        }),

        HttpModule, // Required for axios request to the ML worker
    ],

    // Registers the controllers that handle HTTP requests for this module.
    controllers: [
        AuthController,
        KycController,
        HandoffController,
        ProfileController,
    ],
    providers: [
        // 1. Shared Services & Guards
        BcryptService,
        JwtAuthGuard,
        HandoffGateway,
        s3StorageService,
        OpenRouterAiService,
        {
            provide: REDIS_CLIENT,
            useFactory: () => {
                return new Redis({
                    host: process.env.REDIS_HOST || 'localhost',
                    port: Number(process.env.REDIS_PORT) || 6379,
                });
            },
        },

        // 2. Standard Providers (Gateways & Use Cases)
        // Handled via interface bindings in section 3

        // 3. Interface Bindings (Contracts -> Concrete Implementations)
        // Maps interface tokens to their concrete implementations.

        // Maps the repository interface token to its MongoDB implementation.
        {
            provide: USER_REPOSITORY,
            useClass: MongoUserRepository,
        },
        // Maps the token service interface token its JWT implementation.
        {
            provide: TOKEN_SERVICE,
            useClass: JwtTokenService,
        },
        {
            provide: OTP_SERVICE,
            useClass: RedisOtpService,
        },
        {
            provide: GENERATE_HANDOFF_SESSION_USE_CASE,
            useClass: GenerateHandoffSessionUseCase,
        },
        {
            provide: LOGIN_USER_USE_CASE,
            useClass: LoginUserUseCase,
        },
        {
            provide: REFRESH_TOKEN_USE_CASE,
            useClass: RefreshTokenUseCase,
        },
        {
            provide: REGISTER_USER_USE_CASE,
            useClass: RegisterUserUseCase,
        },
        {
            provide: SUBMIT_KYC_DOCUMENT_USE_CASE,
            useClass: SubmitKycDocumentUseCase,
        },
        {
            provide: SUBMIT_LIVE_SELFIE_USE_CASE,
            useClass: SubmitLiveSelfieUseCase,
        },
        {
            provide: VALIDATE_HANDOFF_USE_CASE,
            useClass: ValidateHandoffUseCase,
        },
        {
            provide: VERIFY_OTP_USE_CASE,
            useClass: VerifyOtpUseCase,
        },
        {
            provide: RESEND_OTP_USE_CASE,
            useClass: ResendOtpUseCase,
        },
        {
            provide: FORGOT_PASSWORD_USE_CASE,
            useClass: ForgotPasswordUseCase,
        },
        {
            provide: RESET_PASSWORD_USE_CASE,
            useClass: ResetPasswordUseCase,
        },
        {
            provide: GOOGLE_LOGIN_USE_CASE,
            useClass: GoogleLoginUseCase,
        },
        // KYC Service bindings
        {
            provide: KYC_HASH_SERVICE,
            useClass: KycHashService,
        },
        {
            provide: PKI_VERIFICATION_SERVICE,
            useClass: AadharPkiService,
        },
        // 
        {
            provide: HANDOFF_SERVICE,
            useClass: RedisHandoffService,
        },
        {
            provide: HANDOFF_NOTIFICATION_SERVICE,
            useExisting: HandoffGateway,
        },
        {
            provide: BIOMETRIC_SERVICE,
            useClass: HttpBiometricService,
        },
        {
            provide: STORAGE_SERVICE,
            useClass: s3StorageService,
        },
        {
            provide: SUBMIT_LIVENESS_CHECK_USE_CASE,
            useClass: SubmitLivenessCheckUseCase,
        },
        {
            provide: SUBMIT_FINAL_VERIFICATION_USE_CASE,
            useClass: SubmitFinalVerificationUseCase,
        },
        {
            provide: UPDATE_PERSONA_USE_CASE,
            useClass: UpdatePersonaUseCase,
        },
        {
            provide: UPDATE_LIFESTYLE_USE_CASE,
            useClass: UpdateLifeStyleUseCase,
        },
        {
            provide: UPDATE_PREFERENCES_USE_CASE,
            useClass: UpdatePreferencesUseCase,
        },
        {
            provide: AI_SERVICE,
            useClass: OpenRouterAiService,
        },
        {
            provide: GENERATE_BIO_USE_CASE,
            useClass: GenerateBioUseCase,
        },
        {
            provide: SAVE_BIO_USE_CASE,
            useClass: SaveBioUseCase,
        }
    ],

    // Makes these repository and token service providers available to other modules.
    exports: [USER_REPOSITORY, TOKEN_SERVICE, OTP_SERVICE, JwtAuthGuard, HANDOFF_SERVICE],
})

export class UserModule {}