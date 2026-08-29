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
import { GetPresignedUrlUseCase } from "./application/use-cases/get-presigned-urls.use-case";
import { SubmitKycDocumentUseCase } from "./application/use-cases/submit-kyc-document.use-case";


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
    ],

    // Registers the controllers that handle HTTP requests for this module.
    controllers: [
        AuthController,
        KycController
    ],
    providers: [
        // Shared Services
        BcryptService,

        // Use Cases
        RegisterUserUseCase,
        VerifyOtpUseCase,
        LoginUserUseCase,
        RefreshTokenUseCase,
        GetPresignedUrlUseCase,
        SubmitKycDocumentUseCase,

        // Maps interface tokens to their concrete implementations.

        // Maps the repository interface token to its MongoDB implementation.
        {
            provide: USER_REPOSITORY,
            useClass: MongoUserRepository,
        },

        // Maps the token service interface token its JWT implementation.
        {
            provide: TOKEN_SERVICE,
            useClass: JwtTokenService
        },

        {
            provide: OTP_SERVICE,
            useClass: RedisOtpService,
        }
    ],

    // Makes these repository and token service providers available to other modules.
    exports: [USER_REPOSITORY, TOKEN_SERVICE, OTP_SERVICE],
})

export class UserModule {}