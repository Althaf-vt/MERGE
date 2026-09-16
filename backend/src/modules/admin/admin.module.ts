import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Admin, AdminSchema } from "./infrastructure/persistence/admin.schema";
import { AdminSeederService } from "./infrastructure/services/admin-seeder.service";
import { ADMIN_REPOSITORY } from "./domain/interfaces/admin-repository.interface";
import { MongoAdminRepository } from "./infrastructure/persistence/mongo-admin.repository";
import { AdminAuthController } from "./presentation/controllers/admin-auth.controller";
import { AdminLoginUseCase } from "./application/use-cases/admin-login.use-case";
import { ADMIN_LOGIN_USE_CASE } from "./application/interfaces/admin-login.use-case.interface";
import { ADMIN_OTP_SERVICE } from "./domain/interfaces/admin-otp.interface";
import { AdminRedisOtpService } from "./infrastructure/services/admin-redis-otp.service";
import { ADMIN_FORGOT_PASSWORD_USE_CASE, ADMIN_RESET_PASSWORD_USE_CASE } from "./application/interfaces/admin-forgot-password.use-case.interface";
import { AdminForgotPasswordUseCase } from "./application/use-cases/admin-forgot-password.use-case";
import { AdminResetPasswordUseCase } from "./application/use-cases/admin-reset-password.use-case";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Admin.name, schema: AdminSchema }]),
    ],

    controllers: [
        AdminAuthController,
    ],

    providers: [
        AdminSeederService,


        {
            provide: ADMIN_REPOSITORY,
            useClass: MongoAdminRepository,
        },
        {
            provide: ADMIN_LOGIN_USE_CASE,
            useClass: AdminLoginUseCase,
        },
        {
            provide: ADMIN_OTP_SERVICE,
            useClass: AdminRedisOtpService,
        },
        {
            provide: ADMIN_FORGOT_PASSWORD_USE_CASE,
            useClass: AdminForgotPasswordUseCase,
        },
        {
            provide: ADMIN_RESET_PASSWORD_USE_CASE,
            useClass: AdminResetPasswordUseCase,
        }
    ],
    exports: [
        ADMIN_REPOSITORY,
    ],

})
export class AdminModule { }