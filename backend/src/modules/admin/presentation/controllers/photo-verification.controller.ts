import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../../../shared/infrastructure/security/guards/jwt-auth.guard";
import { AdminSessionGuard } from "../../infrastructure/security/guards/admin-session.guard";
import { AdminPermissionsGuard } from "../../../../shared/infrastructure/security/guards/admin-permissions.guard";
import { RequirePermissions } from "../../../../shared/infrastructure/security/decorators/require-permissions.decorator";
import { AdminPermission } from "../../domain/enums/admin-permission.enums";
import { AuthenticatedRequest } from "../../../../shared/infrastructure/security/interfaces/authenticated-request.interface";
import { GetPhotoTasksQueryDto, RejectPhotoTaskDto } from "../../application/dtos/photo-verification.dto";
import { AdminRole } from "../../domain/enums/admin.enums";
import { 
    APPROVE_PHOTO_VERIFICATION_USE_CASE, 
    CLAIM_PHOTO_TASK_USE_CASE, 
    GET_PHOTO_TASKS_USE_CASE, 
    HydratedPhotoTaskResult, 
    IApprovePhotoVerificationUseCase, 
    IClaimPhotoTaskUseCase, 
    IGetPhotoTasksUseCase, 
    IRejectPhotoVerificationUseCase, 
    IReleasePhotoTaskClaimUseCase, 
    ITakeoverPhotoTaskClaimUseCase, 
    REJECT_PHOTO_VERIFICATION_USE_CASE, 
    RELEASE_PHOTO_TASK_CLAIM_USE_CASE, 
    TAKEOVER_PHOTO_TASK_CLAIM_USE_CASE 
} from "../../application/interfaces/photo-verification.use-case.interface";
import { PhotoTaskDtoMapper } from "../mappers/photo-task-dto.mapper";

@Controller('admin/photo-verification')
@UseGuards(JwtAuthGuard, AdminSessionGuard, AdminPermissionsGuard)
export class PhotoVerificationController {
    constructor(
        @Inject(GET_PHOTO_TASKS_USE_CASE) private readonly _getPhotoTasksUseCase: IGetPhotoTasksUseCase,
        @Inject(CLAIM_PHOTO_TASK_USE_CASE) private readonly _claimTaskUseCase: IClaimPhotoTaskUseCase,
        @Inject(RELEASE_PHOTO_TASK_CLAIM_USE_CASE) private readonly _releaseClaimUseCase: IReleasePhotoTaskClaimUseCase,
        @Inject(TAKEOVER_PHOTO_TASK_CLAIM_USE_CASE) private readonly _takeoverClaimUseCase: ITakeoverPhotoTaskClaimUseCase,
        @Inject(APPROVE_PHOTO_VERIFICATION_USE_CASE) private readonly _approvePhotoUseCase: IApprovePhotoVerificationUseCase,
        @Inject(REJECT_PHOTO_VERIFICATION_USE_CASE) private readonly _rejectPhotoUseCase: IRejectPhotoVerificationUseCase,
    ) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    @RequirePermissions(AdminPermission.KYC_VIEW)
    async getTasks(@Query() query: GetPhotoTasksQueryDto) {
        const result = await this._getPhotoTasksUseCase.execute(query);

        const mappedData = result.data.map((item: HydratedPhotoTaskResult) => 
            PhotoTaskDtoMapper.toResponseDto(item.task, item.signedKycUrl, item.signedUploadedUrl)
        );
        return { success: true, data: mappedData, meta: { total: result.total, page: result.page, limit: result.limit } };
    }

    @Post(':id/claim')
    @HttpCode(HttpStatus.OK)
    @RequirePermissions(AdminPermission.KYC_APPROVE)
    async claimTask(@Param('id') taskId: string, @Req() req: AuthenticatedRequest) {
        await this._claimTaskUseCase.execute(taskId, req.user.userId);
        return { success: true, message: 'Task claimed successfully.' };
    }

    @Post(':id/release')
    @HttpCode(HttpStatus.OK)
    @RequirePermissions(AdminPermission.KYC_APPROVE)
    async releaseClaim(@Param('id') taskId: string, @Req() req: AuthenticatedRequest) {
        const isSuperAdmin = req.user.role === AdminRole.SUPER_ADMIN;
        await this._releaseClaimUseCase.execute(taskId, req.user.userId, isSuperAdmin);
        return { success: true, message: 'Claim released successfully.' };
    }

    @Post(':id/takeover')
    @HttpCode(HttpStatus.OK)
    @RequirePermissions(AdminPermission.KYC_APPROVE)
    async takeoverClaim(@Param('id') taskId: string, @Req() req: AuthenticatedRequest) {
        if (req.user.role !== AdminRole.SUPER_ADMIN) {
            return { success: false, message: 'Forbidden. Only Super Admins can take over claims.' };
        }
        await this._takeoverClaimUseCase.execute(taskId, req.user.userId);
        return { success: true, message: 'Task forcefully claimed.' };
    }

    @Post(':id/approve')
    @HttpCode(HttpStatus.OK)
    @RequirePermissions(AdminPermission.KYC_APPROVE)
    async approvePhoto(@Param('id') taskId: string, @Req() req: AuthenticatedRequest) {
        const isSuperAdmin = req.user.role === AdminRole.SUPER_ADMIN;
        await this._approvePhotoUseCase.execute(taskId, req.user.userId, isSuperAdmin);
        return { success: true, message: 'Photo approved successfully.' };
    }

    @Post(':id/reject')
    @HttpCode(HttpStatus.OK)
    @RequirePermissions(AdminPermission.KYC_REJECT)
    async rejectPhoto(@Param('id') taskId: string, @Body() dto: RejectPhotoTaskDto, @Req() req: AuthenticatedRequest) {
        const isSuperAdmin = req.user.role === AdminRole.SUPER_ADMIN;
        await this._rejectPhotoUseCase.execute(taskId, req.user.userId, isSuperAdmin, dto);
        return { success: true, message: 'Photo rejected successfully.' };
    }
}