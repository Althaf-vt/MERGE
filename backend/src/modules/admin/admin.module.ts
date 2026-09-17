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
import { ADMIN_FORGOT_PASSWORD_USE_CASE, ADMIN_RESET_PASSWORD_USE_CASE, ADMIN_VERIFY_RESET_OTP_USE_CASE } from "./application/interfaces/admin-forgot-password.use-case.interface";
import { AdminForgotPasswordUseCase } from "./application/use-cases/admin-forgot-password.use-case";
import { AdminResetPasswordUseCase } from "./application/use-cases/admin-reset-password.use-case";
import { AdminVerifyResetOtpDto } from "./application/dtos/admin-forgot-password.dto";
import { AdminVerifyResetOtpUseCase } from "./application/use-cases/admin-verify-reset-otp.use-case";
import { ADMIN_REFRESH_TOKEN_USE_CASE } from "./application/interfaces/admin-refresh-token.use-case.interface";
import { AdminRefreshTokenUsecase } from "./application/use-cases/admin-refresh-token.use-case";

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
            provide: ADMIN_VERIFY_RESET_OTP_USE_CASE,
            useClass: AdminVerifyResetOtpUseCase,
        },
        {
            provide: ADMIN_RESET_PASSWORD_USE_CASE,
            useClass: AdminResetPasswordUseCase,
        },
        {
            provide: ADMIN_REFRESH_TOKEN_USE_CASE,
            useClass: AdminRefreshTokenUsecase,
        }
    ],
    exports: [
        ADMIN_REPOSITORY,
    ],

})
export class AdminModule { }