import { Global, Module } from "@nestjs/common";
import { BcryptService } from "./shared/infrastructure/security/bcrypt.service";
import { EMAIL_SERVICE } from "./modules/users/domain/interfaces/email-service.interface";
import { NodeMailerEmailService } from "./modules/users/infrastructure/email/nodemailer-email.service";

@Global() // Make these providers available app-wide without re-importing the module
@Module({
  providers: [
    BcryptService,
    {
      provide: EMAIL_SERVICE,
      useClass: NodeMailerEmailService,
    },
  ],
  exports: [BcryptService, EMAIL_SERVICE],
})

export class SharedModule {}