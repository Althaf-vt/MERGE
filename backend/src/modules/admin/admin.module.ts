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
import { AdminVerifyResetOtpUseCase } from "./application/use-cases/admin-verify-reset-otp.use-case";
import { ADMIN_REFRESH_TOKEN_USE_CASE } from "./application/interfaces/admin-refresh-token.use-case.interface";
import { AdminRefreshTokenUsecase } from "./application/use-cases/admin-refresh-token.use-case";
import { UserModule } from "../users/users.module";
import { ModerationLogSchema, ModerationLogSchemaClass } from "./infrastructure/persistence/moderation-log.schema";
import { MODERATION_LOG_REPOSITORY } from "./domain/interfaces/moderation-log-repository.interface";
import { MongoModerationLogRepository } from "./infrastructure/persistence/mongo-moderation-log.repository";
import { MANAGE_USER_STATUS_USE_CASE } from "./application/interfaces/manage-user-status.use-case.interface";
import { ManageUserStatusUseCase } from "./application/use-cases/manage-user-status.use-case";
import { GET_ADMIN_USERS_USE_CASE } from "./application/interfaces/get-admin-users.use-case.interface";
import { GetAdminUsersUserCase } from "./application/use-cases/get-admin-users.use-case";
import { AdminUsersController } from "./presentation/controllers/admin-users.controller";
import { AdminManagementController } from "./presentation/controllers/admin-management.controller";
import { ADMIN_INVITE_SERVICE } from "./domain/interfaces/admin-invite.interface";
import { AdminRedisInviteService } from "./infrastructure/services/admin-redis-invite.service";
import { ACCEPT_ADMIN_INVITE_USE_CASE, INVITE_ADMIN_USE_CASE, UPDATE_ADMIN_USE_CASE } from "./application/interfaces/admin-management.use-case.interface";
import { UpdateAdminUseCase } from "./application/use-cases/update-admin.use-case";
import { AcceptAdminInviteUseCase } from "./application/use-cases/accept-admin-invite.use-case";
import { InviteAdminUseCase } from "./application/use-cases/invite-admin.use-case";
import { GET_ADMINS_USE_CASE } from "./application/interfaces/get-admins.use-case.interface";
import { GetAdminsUseCase } from "./application/use-cases/get-admins.use-case";

@Module({
    imports: [
        UserModule,
        MongooseModule.forFeature([
            { name: Admin.name, schema: AdminSchema },
            {name: ModerationLogSchemaClass.name, schema: ModerationLogSchema}
        ]),
    ],

    controllers: [
        AdminAuthController,
        AdminUsersController,
        AdminManagementController,
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
        },
        {
            provide: MODERATION_LOG_REPOSITORY,
            useClass: MongoModerationLogRepository,
        },
        {
            provide: MANAGE_USER_STATUS_USE_CASE,
            useClass: ManageUserStatusUseCase,
        },
        {
            provide: GET_ADMIN_USERS_USE_CASE,
            useClass: GetAdminUsersUserCase,
        },
        {
            provide: ADMIN_INVITE_SERVICE,
            useClass: AdminRedisInviteService,
        },
        {
            provide: INVITE_ADMIN_USE_CASE,
            useClass: InviteAdminUseCase,
        },
        {
            provide: ACCEPT_ADMIN_INVITE_USE_CASE,
            useClass: AcceptAdminInviteUseCase,
        },
        {
            provide: UPDATE_ADMIN_USE_CASE,
            useClass: UpdateAdminUseCase,
        },
        {
            provide: GET_ADMINS_USE_CASE,
            useClass: GetAdminsUseCase,
        }
    ],
    exports: [
        ADMIN_REPOSITORY,
    ],

})
export class AdminModule { }