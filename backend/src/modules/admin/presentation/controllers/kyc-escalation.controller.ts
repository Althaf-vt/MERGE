import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { API_ENDPOINTS } from "../../../../shared/presentation/constants/api-endpoints.constant";
import { JwtAuthGuard } from "../../../../shared/infrastructure/security/guards/jwt-auth.guard";
import { AdminSessionGuard } from "../../infrastructure/security/guards/admin-session.guard";
import { AdminPermissionsGuard } from "../../../../shared/infrastructure/security/guards/admin-permissions.guard";
import { APPROVE_KYC_TASK_USE_CASE, CLAIM_KYC_TASK_USE_CASE, GET_KYC_TASKS_USE_CASE, IApproveKycTaskUseCase, IClaimKycTaskUseCase, IGetKycTasksUseCase, IRejectKycTaskUseCase, IReleaseKycTaskClaimUseCase, IRequestKycResubmissionUseCase, ITakeoverKycTaskClaimUseCase, REJECT_KYC_TASK_USE_CASE, RELEASE_KYC_TASK_CLAIM_USE_CASE, REQUEST_RESUBMISSION_KYC_TASK_USE_CASE, TAKEOVER_KYC_TASK_CLAIM_USE_CASE } from "../../application/interfaces/kyc-escalation.use-case.interface";
import { RequirePermissions } from "../../../../shared/infrastructure/security/decorators/require-permissions.decorator";
import { AdminPermission } from "../../domain/enums/admin-permission.enums";
import { GetKycTasksQueryDto, KycEscalationTaskResponseDto, RejectKycTaskDto, RequestKycResubmissionDto } from "../../application/dtos/kyc-escalation.dto";
import { ApiResponse } from "../../../../shared/presentation/interfaces/api-response.interface";
import { KycEscalationDtoMapper } from "../mappers/kyc-escalation-dto.mapper";
import { AuthenticatedRequest } from "../../../../shared/infrastructure/security/interfaces/authenticated-request.interface";
import { RESPONSE_MESSAGES } from "../../../../shared/presentation/constants/response-messages.constant";
import { AdminRole } from "../../domain/enums/admin.enums";
import { AdminRolesGuard } from "../../../../shared/infrastructure/security/guards/admin-roles.guard";
import { RequireRoles } from "../../../../shared/infrastructure/security/decorators/require-roles.decorator";

@Controller(API_ENDPOINTS.ADMIN.KYC_ESCALATION.BASE)
@UseGuards(JwtAuthGuard, AdminSessionGuard, AdminPermissionsGuard)
export class KycEscalationController {
    constructor(
        @Inject(GET_KYC_TASKS_USE_CASE) private readonly _getTasksUseCase: IGetKycTasksUseCase,
        @Inject(CLAIM_KYC_TASK_USE_CASE) private readonly _claimTaskUseCase: IClaimKycTaskUseCase,
        @Inject(RELEASE_KYC_TASK_CLAIM_USE_CASE) private readonly _releaseClaimUseCase: IReleaseKycTaskClaimUseCase,
        @Inject(TAKEOVER_KYC_TASK_CLAIM_USE_CASE) private readonly _takeoverClaimUseCase: ITakeoverKycTaskClaimUseCase,
        @Inject(APPROVE_KYC_TASK_USE_CASE) private readonly _approveTaskUseCase: IApproveKycTaskUseCase,
        @Inject(REJECT_KYC_TASK_USE_CASE) private readonly _rejectTaskUseCase: IRejectKycTaskUseCase,
        @Inject(REQUEST_RESUBMISSION_KYC_TASK_USE_CASE) private readonly _requestResubmissionUseCase: IRequestKycResubmissionUseCase,
    ) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    @RequirePermissions(AdminPermission.KYC_VIEW)
    async getTasks(@Query() query: GetKycTasksQueryDto): Promise<ApiResponse<KycEscalationTaskResponseDto[]>> {
        const result = await this._getTasksUseCase.execute(query);
        
        const mappedData = result.data.map(item => KycEscalationDtoMapper.toResponseDto(item));

        return { 
            success: true, 
            data: mappedData, 
            meta: { total: result.total, page: result.page, limit: result.limit } 
        };
    }

    @Post(API_ENDPOINTS.ADMIN.KYC_ESCALATION.CLAIM)
    @HttpCode(HttpStatus.OK)
    @RequirePermissions(AdminPermission.KYC_APPROVE)
    async claimTask(@Param('id') taskId: string, @Req() req: AuthenticatedRequest): Promise<ApiResponse> {
        await this._claimTaskUseCase.execute(taskId, req.user.userId);
        return { success: true, message: RESPONSE_MESSAGES.ADMIN.TASK_CLAIMED };
    }

    @Post(API_ENDPOINTS.ADMIN.KYC_ESCALATION.RELEASE)
    @HttpCode(HttpStatus.OK)
    @RequirePermissions(AdminPermission.KYC_APPROVE)
    async releaseClaim(@Param('id') taskId: string, @Req() req: AuthenticatedRequest): Promise<ApiResponse> {
        await this._releaseClaimUseCase.execute(taskId, req.user.userId, req.user.role);
        return { success: true, message: RESPONSE_MESSAGES.ADMIN.CLAIM_RELEASED };
    }

    @Post(API_ENDPOINTS.ADMIN.KYC_ESCALATION.TAKEOVER)
    @HttpCode(HttpStatus.OK)
    @UseGuards(AdminRolesGuard)
    @RequireRoles(AdminRole.SUPER_ADMIN)
    @RequirePermissions(AdminPermission.KYC_APPROVE)
    async takeoverClaim(@Param('id') taskId: string, @Req() req: AuthenticatedRequest): Promise<ApiResponse> {
        await this._takeoverClaimUseCase.execute(taskId, req.user.userId);
        return { success: true, message: RESPONSE_MESSAGES.ADMIN.FORCE_TAKEOVER };
    }

    @Post(API_ENDPOINTS.ADMIN.KYC_ESCALATION.APPROVE)
    @HttpCode(HttpStatus.OK)
    @RequirePermissions(AdminPermission.KYC_APPROVE)
    async approveTask(@Param('id') taskId: string, @Req() req: AuthenticatedRequest): Promise<ApiResponse> {
        await this._approveTaskUseCase.execute(taskId, req.user.userId, req.user.role);
        return { success: true, message: RESPONSE_MESSAGES.ADMIN.KYC_APPROVED };
    }

    @Post(API_ENDPOINTS.ADMIN.KYC_ESCALATION.REJECT)
    @HttpCode(HttpStatus.OK)
    @RequirePermissions(AdminPermission.KYC_REJECT)
    async rejectTask(@Param('id') taskId: string, @Body() dto: RejectKycTaskDto, @Req() req: AuthenticatedRequest): Promise<ApiResponse> {
        await this._rejectTaskUseCase.execute(taskId, req.user.userId, req.user.role, dto);
        return { success: true, message: RESPONSE_MESSAGES.ADMIN.KYC_REJECTED };
    }

    @Post(API_ENDPOINTS.ADMIN.KYC_ESCALATION.REQUEST_RESUBMISSION)
    @HttpCode(HttpStatus.OK)
    @RequirePermissions(AdminPermission.KYC_REJECT)
    async requestResubmission(@Param('id') taskId: string, @Body() dto: RequestKycResubmissionDto, @Req() req: AuthenticatedRequest): Promise<ApiResponse> {
        await this._requestResubmissionUseCase.execute(taskId, req.user.userId, req.user.role, dto);
        return { success: true, message: RESPONSE_MESSAGES.ADMIN.KYC_RESUBMISSION_REQUESTED };
    }
}