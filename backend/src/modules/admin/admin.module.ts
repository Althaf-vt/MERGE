import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Admin, AdminSchema } from "./infrastructure/persistence/admin.schema";
import { AdminSeederService } from "./infrastructure/services/admin-seeder.service";
import { ADMIN_REPOSITORY } from "./domain/interfaces/admin-repository.interface";
import { AdminRepository } from "./infrastructure/persistence/mongo-admin.repository";
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
import { AdminRefreshTokenUseCase } from "./application/use-cases/admin-refresh-token.use-case";
import { ADMIN_LOGOUT_USE_CASE } from "./application/interfaces/admin-logout.use-case.interface";
import { AdminLogoutUseCase } from "./application/use-cases/admin-logout.use-case";
import { UserModule } from "../users/users.module";
import { ModerationLogSchema, ModerationLogSchemaClass } from "./infrastructure/persistence/moderation-log.schema";
import { MODERATION_LOG_REPOSITORY } from "./domain/interfaces/moderation-log-repository.interface";
import { ModerationLogRepository } from "./infrastructure/persistence/mongo-moderation-log.repository";
import { AdminAuditLogSchema, AdminAuditLogSchemaClass } from "./infrastructure/persistence/admin-audit-log.schema";
import { ADMIN_AUDIT_LOG_REPOSITORY } from "./domain/interfaces/admin-audit-log-repository.interface";
import { AdminAuditLogRepository } from "./infrastructure/persistence/mongo-admin-audit-log.repository";
import { GET_ADMIN_AUDIT_LOGS_USE_CASE, GET_SCENARIO_ACTIVITY_HISTORY_USE_CASE, RECORD_ADMIN_AUDIT_LOG_USE_CASE } from "./application/interfaces/admin-audit.use-cases.interface";
import { RecordAdminAuditLogUseCase } from "./application/use-cases/record-admin-audit-log.use-case";
import { GetAdminAuditLogsUseCase } from "./application/use-cases/get-admin-audit-logs.use-case";
import { GetScenarioActivityHistoryUseCase } from "./application/use-cases/get-scenario-activity-history.use-case";
import { AdminAuditInterceptor } from "./presentation/interceptors/admin-audit.interceptor";
import { MANAGE_USER_STATUS_USE_CASE } from "./application/interfaces/manage-user-status.use-case.interface";
import { ManageUserStatusUseCase } from "./application/use-cases/manage-user-status.use-case";
import { GET_ADMIN_USERS_USE_CASE } from "./application/interfaces/get-admin-users.use-case.interface";
import { GetAdminUsersUseCase } from "./application/use-cases/get-admin-users.use-case";
import { GET_ADMIN_USER_DETAILS_USE_CASE } from "./application/interfaces/get-admin-user-details.use-case.interface";
import { GetAdminUserDetailsUseCase } from "./application/use-cases/get-admin-user-details.use-case";
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
import { DEACTIVATE_ADMIN_USE_CASE, REACTIVATE_ADMIN_USE_CASE, SUSPEND_ADMIN_USE_CASE } from "./application/interfaces/admin-status.use-case.interface";
import { SuspendAdminUseCase } from "./application/use-cases/suspend-admin.use-case";
import { ReactivateAdminUseCase } from "./application/use-cases/reactivate-admin.use-case";
import { DeactivateAdminUseCase } from "./application/use-cases/deactivate-admin.use-case";
import { CANCEL_ADMIN_INVITE_USE_CASE, REINVITE_ADMIN_USE_CASE } from "./application/interfaces/admin-invitation-lifecycle.use-case.interface";
import { ReinviteAdminUseCase } from "./application/use-cases/reinvite-admin.use-case";
import { CancelAdminInviteUseCase } from "./application/use-cases/cancel-admin-invite.use-case";
import { FORCE_LOGOUT_ADMIN_USE_CASE, GET_ADMIN_DETAILS_USE_CASE } from "./application/interfaces/admin-personnel.use-case.interface";
import { ForceLogoutAdminUseCase } from "./application/use-cases/force-logout-admin.use-case";
import { GetAdminDetailsUseCase } from "./application/use-cases/get-admin-details.use-case";
import { AdminRedisSessionService } from "./infrastructure/services/admin-redis-session.service";
import { ADMIN_SESSION_SERVICE } from "./domain/interfaces/admin-session.interface";
import { PHOTO_VERIFICATION_TASK_REPOSITORY } from "./domain/interfaces/photo-verification-task-repository.interface";
import { PhotoVerificationTaskRepository } from "./infrastructure/persistence/mongo-photo-verification-task.repository";
import { APPROVE_PHOTO_VERIFICATION_USE_CASE, CLAIM_PHOTO_TASK_USE_CASE, CREATE_PHOTO_VERIFICATION_TASK_USE_CASE, GET_PHOTO_TASKS_USE_CASE, REJECT_PHOTO_VERIFICATION_USE_CASE, RELEASE_PHOTO_TASK_CLAIM_USE_CASE, TAKEOVER_PHOTO_TASK_CLAIM_USE_CASE } from "./application/interfaces/photo-verification.use-case.interface";
import { GetPhotoTasksUseCase } from "./application/use-cases/get-photo-tasks.use-case";
import { ApprovePhotoVerificationUseCase, ClaimPhotoTaskUseCase, CreatePhotoVerificationTaskUseCase, RejectPhotoVerificationUseCase, ReleasePhotoTaskClaimUseCase, TakeoverPhotoTaskClaimUseCase } from "./application/use-cases/manage-photo-verification.use-case";
import { UserPhotoFlaggedListener } from "./application/listeners/user-photo-flagged.listener";
import { PhotoVerificationController } from "./presentation/controllers/photo-verification.controller";
import { PhotoVerificationTaskSchema, PhotoVerificationTaskSchemaClass } from "./infrastructure/persistence/photo-verification-task.schema";
import { KYC_ESCALATION_TASK_REPOSITORY } from "./domain/interfaces/kyc-escalation-task-repository.interface";
import { KycEscalationTaskRepository } from "./infrastructure/persistence/mongo-kyc-escalation-task.repository";
import {
    APPROVE_KYC_TASK_USE_CASE,
    CLAIM_KYC_TASK_USE_CASE,
    GET_KYC_TASKS_USE_CASE,
    REJECT_KYC_TASK_USE_CASE,
    RELEASE_KYC_TASK_CLAIM_USE_CASE,
    REQUEST_RESUBMISSION_KYC_TASK_USE_CASE,
    TAKEOVER_KYC_TASK_CLAIM_USE_CASE,
} from "./application/interfaces/kyc-escalation.use-case.interface";
import {
    ApproveKycTaskUseCase,
    ClaimKycTaskUseCase,
    GetKycTasksUseCase,
    RejectKycTaskUseCase,
    ReleaseKycTaskClaimUseCase,
    RequestKycResubmissionUseCase,
    TakeoverKycTaskClaimUseCase,
} from "./application/use-cases/manage-kyc-escalation.use-case";
import { KycEscalationController } from "./presentation/controllers/kyc-escalation.controller";
import { KycEscalationTaskSchema, KycEscalationTaskSchemaClass } from "./infrastructure/persistence/kyc-escalation-task.schema";
import { CREATE_KYC_ESCALATION_TASK_USE_CASE } from "./application/interfaces/create-kyc-task.use-case.interface";
import { CreateKycEscalationTaskUseCase } from "./application/use-cases/create-kyc-escalation-task.use-case";
import { UserKycEscalatedListener } from "./application/listeners/user-kyc-escalated.listener";
import { ScenePartnerModule } from "../scene-partner/scene-partner.module";
import { AdminScenePartnerController } from "./presentation/controllers/admin-scene-partner.controller";
import { AdminAuditLogController } from "./presentation/controllers/admin-audit-log.controller";
import { ADMIN_APP_CONFIG } from "./application/interfaces/admin-app-config.interface";
import { EnvConfig } from "../../shared/infrastructure/config/env.config";
import {
    ADMIN_CREATE_SCENARIO_USE_CASE,
    ADMIN_EXPORT_SCENARIOS_USE_CASE,
    ADMIN_GET_SCENARIO_BY_ID_USE_CASE,
    ADMIN_GET_SCENARIO_IN_DEPTH_USE_CASE,
    ADMIN_GET_SCENARIOS_USE_CASE,
    ADMIN_GET_SCENE_ANALYTICS_USE_CASE,
    ADMIN_GET_SCENE_SESSION_DETAILS_USE_CASE,
    ADMIN_GET_SCENE_SESSIONS_USE_CASE,
    ADMIN_SEND_PREVIEW_TURN_USE_CASE,
    ADMIN_START_PREVIEW_SESSION_USE_CASE,
    ADMIN_TOGGLE_SCENARIO_STATUS_USE_CASE,
    ADMIN_UPDATE_PREVIEW_COACHING_USE_CASE,
    ADMIN_UPDATE_SCENARIO_USE_CASE,
} from "./application/interfaces/admin-scene-partner.use-cases.interface";
import {
    AdminCreateScenarioUseCase,
    AdminExportScenariosUseCase,
    AdminGetScenarioByIdUseCase,
    AdminGetScenarioInDepthUseCase,
    AdminGetScenariosUseCase,
    AdminToggleScenarioStatusUseCase,
    AdminUpdateScenarioUseCase,
} from "./application/use-cases/admin-scenario.use-cases";
import {
    AdminGetSceneAnalyticsUseCase,
    AdminGetSceneSessionDetailsUseCase,
    AdminGetSceneSessionsUseCase,
    AdminSendPreviewTurnUseCase,
    AdminStartPreviewSessionUseCase,
    AdminUpdatePreviewCoachingUseCase,
} from "./application/use-cases/admin-scene-session.use-cases";

@Module({
    imports: [
        UserModule,
        ScenePartnerModule,
        MongooseModule.forFeature([
            { name: Admin.name, schema: AdminSchema },
            { name: ModerationLogSchemaClass.name, schema: ModerationLogSchema },
            { name: PhotoVerificationTaskSchemaClass.name, schema: PhotoVerificationTaskSchema },
            { name: KycEscalationTaskSchemaClass.name, schema: KycEscalationTaskSchema },
            { name: AdminAuditLogSchemaClass.name, schema: AdminAuditLogSchema },
        ]),
    ],
    controllers: [
        AdminAuthController,
        AdminUsersController,
        AdminManagementController,
        PhotoVerificationController,
        KycEscalationController,
        AdminScenePartnerController,
        AdminAuditLogController,
    ],
    providers: [
        AdminSeederService,
        {
            provide: ADMIN_APP_CONFIG,
            useValue: {
                refreshExpirationSeconds: EnvConfig.jwt.refreshExpirationSeconds,
                inviteTtlSeconds: EnvConfig.admin.inviteTtlSeconds,
            },
        },
        { provide: ADMIN_REPOSITORY, useClass: AdminRepository },
        { provide: ADMIN_LOGIN_USE_CASE, useClass: AdminLoginUseCase },
        { provide: ADMIN_OTP_SERVICE, useClass: AdminRedisOtpService },
        { provide: ADMIN_FORGOT_PASSWORD_USE_CASE, useClass: AdminForgotPasswordUseCase },
        { provide: ADMIN_VERIFY_RESET_OTP_USE_CASE, useClass: AdminVerifyResetOtpUseCase },
        { provide: ADMIN_RESET_PASSWORD_USE_CASE, useClass: AdminResetPasswordUseCase },
        { provide: ADMIN_REFRESH_TOKEN_USE_CASE, useClass: AdminRefreshTokenUseCase },
        { provide: ADMIN_LOGOUT_USE_CASE, useClass: AdminLogoutUseCase },
        { provide: MODERATION_LOG_REPOSITORY, useClass: ModerationLogRepository },
        { provide: MANAGE_USER_STATUS_USE_CASE, useClass: ManageUserStatusUseCase },
        { provide: GET_ADMIN_USERS_USE_CASE, useClass: GetAdminUsersUseCase },
        { provide: GET_ADMIN_USER_DETAILS_USE_CASE, useClass: GetAdminUserDetailsUseCase },
        { provide: ADMIN_INVITE_SERVICE, useClass: AdminRedisInviteService },
        { provide: INVITE_ADMIN_USE_CASE, useClass: InviteAdminUseCase },
        { provide: ACCEPT_ADMIN_INVITE_USE_CASE, useClass: AcceptAdminInviteUseCase },
        { provide: REINVITE_ADMIN_USE_CASE, useClass: ReinviteAdminUseCase },
        { provide: CANCEL_ADMIN_INVITE_USE_CASE, useClass: CancelAdminInviteUseCase },
        { provide: UPDATE_ADMIN_USE_CASE, useClass: UpdateAdminUseCase },
        { provide: GET_ADMINS_USE_CASE, useClass: GetAdminsUseCase },
        { provide: SUSPEND_ADMIN_USE_CASE, useClass: SuspendAdminUseCase },
        { provide: DEACTIVATE_ADMIN_USE_CASE, useClass: DeactivateAdminUseCase },
        { provide: REACTIVATE_ADMIN_USE_CASE, useClass: ReactivateAdminUseCase },
        { provide: FORCE_LOGOUT_ADMIN_USE_CASE, useClass: ForceLogoutAdminUseCase },
        { provide: GET_ADMIN_DETAILS_USE_CASE, useClass: GetAdminDetailsUseCase },
        { provide: ADMIN_SESSION_SERVICE, useClass: AdminRedisSessionService },
        { provide: PHOTO_VERIFICATION_TASK_REPOSITORY, useClass: PhotoVerificationTaskRepository },
        { provide: GET_PHOTO_TASKS_USE_CASE, useClass: GetPhotoTasksUseCase },
        { provide: CLAIM_PHOTO_TASK_USE_CASE, useClass: ClaimPhotoTaskUseCase },
        { provide: RELEASE_PHOTO_TASK_CLAIM_USE_CASE, useClass: ReleasePhotoTaskClaimUseCase },
        { provide: TAKEOVER_PHOTO_TASK_CLAIM_USE_CASE, useClass: TakeoverPhotoTaskClaimUseCase },
        { provide: APPROVE_PHOTO_VERIFICATION_USE_CASE, useClass: ApprovePhotoVerificationUseCase },
        { provide: REJECT_PHOTO_VERIFICATION_USE_CASE, useClass: RejectPhotoVerificationUseCase },
        { provide: CREATE_PHOTO_VERIFICATION_TASK_USE_CASE, useClass: CreatePhotoVerificationTaskUseCase },
        // KYC Escalation Use Cases & Repository
        { provide: KYC_ESCALATION_TASK_REPOSITORY, useClass: KycEscalationTaskRepository },
        { provide: GET_KYC_TASKS_USE_CASE, useClass: GetKycTasksUseCase },
        { provide: CLAIM_KYC_TASK_USE_CASE, useClass: ClaimKycTaskUseCase },
        { provide: RELEASE_KYC_TASK_CLAIM_USE_CASE, useClass: ReleaseKycTaskClaimUseCase },
        { provide: TAKEOVER_KYC_TASK_CLAIM_USE_CASE, useClass: TakeoverKycTaskClaimUseCase },
        { provide: APPROVE_KYC_TASK_USE_CASE, useClass: ApproveKycTaskUseCase },
        { provide: REJECT_KYC_TASK_USE_CASE, useClass: RejectKycTaskUseCase },
        { provide: REQUEST_RESUBMISSION_KYC_TASK_USE_CASE, useClass: RequestKycResubmissionUseCase },
        { provide: CREATE_KYC_ESCALATION_TASK_USE_CASE, useClass: CreateKycEscalationTaskUseCase },
        { provide: ADMIN_AUDIT_LOG_REPOSITORY, useClass: AdminAuditLogRepository },
        { provide: RECORD_ADMIN_AUDIT_LOG_USE_CASE, useClass: RecordAdminAuditLogUseCase },
        { provide: GET_ADMIN_AUDIT_LOGS_USE_CASE, useClass: GetAdminAuditLogsUseCase },
        { provide: GET_SCENARIO_ACTIVITY_HISTORY_USE_CASE, useClass: GetScenarioActivityHistoryUseCase },
        // Scenario Administration Use Cases
        { provide: ADMIN_CREATE_SCENARIO_USE_CASE, useClass: AdminCreateScenarioUseCase },
        { provide: ADMIN_GET_SCENARIOS_USE_CASE, useClass: AdminGetScenariosUseCase },
        { provide: ADMIN_GET_SCENARIO_BY_ID_USE_CASE, useClass: AdminGetScenarioByIdUseCase },
        { provide: ADMIN_GET_SCENARIO_IN_DEPTH_USE_CASE, useClass: AdminGetScenarioInDepthUseCase },
        { provide: ADMIN_UPDATE_SCENARIO_USE_CASE, useClass: AdminUpdateScenarioUseCase },
        { provide: ADMIN_TOGGLE_SCENARIO_STATUS_USE_CASE, useClass: AdminToggleScenarioStatusUseCase },
        { provide: ADMIN_EXPORT_SCENARIOS_USE_CASE, useClass: AdminExportScenariosUseCase },
        // Scene Sessions & Analytics Use Cases
        { provide: ADMIN_GET_SCENE_ANALYTICS_USE_CASE, useClass: AdminGetSceneAnalyticsUseCase },
        { provide: ADMIN_GET_SCENE_SESSIONS_USE_CASE, useClass: AdminGetSceneSessionsUseCase },
        { provide: ADMIN_GET_SCENE_SESSION_DETAILS_USE_CASE, useClass: AdminGetSceneSessionDetailsUseCase },
        { provide: ADMIN_START_PREVIEW_SESSION_USE_CASE, useClass: AdminStartPreviewSessionUseCase },
        { provide: ADMIN_SEND_PREVIEW_TURN_USE_CASE, useClass: AdminSendPreviewTurnUseCase },
        { provide: ADMIN_UPDATE_PREVIEW_COACHING_USE_CASE, useClass: AdminUpdatePreviewCoachingUseCase },
        AdminAuditInterceptor,
        // Register Event Listener
        UserPhotoFlaggedListener,
        UserKycEscalatedListener,
    ],
    exports: [],
})
export class AdminModule { }