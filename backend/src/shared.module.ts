import { Global, Module } from "@nestjs/common";
import { EMAIL_SERVICE } from "./modules/users/domain/interfaces/email-service.interface";
import { NodeMailerEmailService } from "./modules/users/infrastructure/email/nodemailer-email.service";
import { PASSWORD_HASHER } from "./shared/domain/interfaces/password-hasher.interface";
import { BcryptService } from "./shared/infrastructure/security/services/bcrypt.service";
import { JwtModule } from "@nestjs/jwt";
import { TOKEN_SERVICE } from "./shared/domain/interfaces/token-service.interface";
import { JwtTokenService } from "./shared/infrastructure/security/services/jwt-token.service";

@Global() // Make these providers available app-wide without re-importing the module
@Module({
  imports: [

    // Configures JWT support for token generation and verification.
    JwtModule.register({
        secret: process.env.JWT_ACCESS_SECRET || 'super-secret-fallback',
    }),
  ],
  providers: [
    {
      provide: PASSWORD_HASHER,
      useClass: BcryptService
    },
    {
      provide: TOKEN_SERVICE,
      useClass: JwtTokenService
    },
    {
      provide: EMAIL_SERVICE,
      useClass: NodeMailerEmailService,
    },
  ],
  exports: [PASSWORD_HASHER, EMAIL_SERVICE, TOKEN_SERVICE, JwtModule],
})

export class SharedModule {}