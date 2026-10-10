import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ACCEPT_ADMIN_INVITE_USE_CASE, IAcceptAdminInviteUseCase, IInviteAdminUseCase, INVITE_ADMIN_USE_CASE, IUpdateAdminUseCase, UPDATE_ADMIN_USE_CASE } from "../../application/interfaces/admin-management.use-case.interface";
import { JwtAuthGuard } from "../../../../shared/infrastructure/security/guards/jwt-auth.guard";
import { AdminPermissionsGuard } from "../../../../shared/infrastructure/security/guards/admin-permissions.guard";
import { RequirePermissions } from "../../../../shared/infrastructure/security/decorators/require-permissions.decorator";
import { AdminPermission } from "../../domain/enums/admin-permission.enums";
import { AcceptAdminInviteDto, InviteAdminDto, UpdateAdminDto } from "../../application/dtos/admin-management.dto";
import { AuthenticatedRequest } from "../../../../shared/infrastructure/security/interfaces/authenticated-request.interface";
import { GET_ADMINS_USE_CASE, IGetAdminsUseCase } from "../../application/interfaces/get-admins.use-case.interface";
import { GetAdminsDto } from "../../application/dtos/get-admins.dto";
import { DEACTIVATE_ADMIN_USE_CASE, IDeactivateAdminUseCase, IReactivateAdminUseCase, ISuspendAdminUseCase, REACTIVATE_ADMIN_USE_CASE, SUSPEND_ADMIN_USE_CASE } from "../../application/interfaces/admin-status.use-case.interface";
import { AdminStatusReasonDto, SuspendAdminDto } from "../../application/dtos/admin-status.dto";
import { CANCEL_ADMIN_INVITE_USE_CASE, ICancelAdminInviteUseCase, IReinviteAdminUseCase, REINVITE_ADMIN_USE_CASE } from "../../application/interfaces/admin-invitation-lifecycle.use-case.interface";
import { FORCE_LOGOUT_ADMIN_USE_CASE, GET_ADMIN_DETAILS_USE_CASE, IForceLogoutAdminUseCase, IGetAdminDetailsUseCase } from "../../application/interfaces/admin-personnel.use-case.interface";
import { AdminSessionGuard } from "../../infrastructure/security/guards/admin-session.guard";
import { API_ENDPOINTS } from "../../../../shared/domain/constants/api-endpoints.constant";
import { ApiResponse } from "../../../../shared/domain/interfaces/api-response.interface";
import { RESPONSE_MESSAGES } from "../../../../shared/domain/constants/response-messages.constant";
import { AdminDetailsDto } from "../../application/dtos/admin-output.dto";

@Controller(API_ENDPOINTS.ADMIN.MANAGEMENT.BASE)
export class AdminManagementController {
    constructor(
        @Inject(INVITE_ADMIN_USE_CASE) private readonly _inviteAdminUseCase: IInviteAdminUseCase,
        @Inject(ACCEPT_ADMIN_INVITE_USE_CASE) private readonly _acceptInviteUseCase: IAcceptAdminInviteUseCase,
        @Inject(UPDATE_ADMIN_USE_CASE) private readonly _updateAdminUseCase: IUpdateAdminUseCase,
        @Inject(GET_ADMINS_USE_CASE) private readonly _getAdminsUseCase: IGetAdminsUseCase,
        @Inject(SUSPEND_ADMIN_USE_CASE) private readonly _suspendAdminUseCase: ISuspendAdminUseCase,
        @Inject(REACTIVATE_ADMIN_USE_CASE) private readonly _reactivateAdminUseCase: IReactivateAdminUseCase,
        @Inject(DEACTIVATE_ADMIN_USE_CASE) private readonly _deactivateAdminUseCase: IDeactivateAdminUseCase,
        @Inject(CANCEL_ADMIN_INVITE_USE_CASE) private readonly _cancelAdminInviteUseCase: ICancelAdminInviteUseCase,
        @Inject(REINVITE_ADMIN_USE_CASE) private readonly _reinviteAdminUseCase: IReinviteAdminUseCase,
        @Inject(GET_ADMIN_DETAILS_USE_CASE) private readonly _getAdminDetailsUseCase: IGetAdminDetailsUseCase,
        @Inject(FORCE_LOGOUT_ADMIN_USE_CASE) private readonly _forceLogoutUseCase: IForceLogoutAdminUseCase,
    ) { }

    @Get()
    @UseGuards(JwtAuthGuard, AdminSessionGuard, AdminPermissionsGuard)
    @RequirePermissions(AdminPermission.ADMINS_VIEW)
    @HttpCode(HttpStatus.OK)
    async getAdmins(
        @Query() query: GetAdminsDto, 
        @Req() req: AuthenticatedRequest
    ): Promise<ApiResponse<AdminDetailsDto[]>> {
        const result = await this._getAdminsUseCase.execute(query, req.user.userId);

        return {
            success: true,
            data: result.data,
            meta: {
                total: result.total,
                page: result.page,
                limit: result.limit,
            }
        };
    }

    @Get(API_ENDPOINTS.ADMIN.MANAGEMENT.BY_ID)
    @UseGuards(JwtAuthGuard, AdminSessionGuard, AdminPermissionsGuard)
    @RequirePermissions(AdminPermission.ADMINS_VIEW)
    @HttpCode(HttpStatus.OK)
    async getAdminDetails(@Param('id') targetAdminId: string): Promise<ApiResponse<AdminDetailsDto>> {
        const data = await this._getAdminDetailsUseCase.execute(targetAdminId);
        return { success: true, data };
    }

    @Post(API_ENDPOINTS.ADMIN.MANAGEMENT.INVITE)
    @UseGuards(JwtAuthGuard, AdminSessionGuard, AdminPermissionsGuard)
    @RequirePermissions(AdminPermission.ADMINS_INVITE)
    @HttpCode(HttpStatus.CREATED)
    async inviteAdmin(
        @Body() dto: InviteAdminDto, 
        @Req() req: AuthenticatedRequest
    ): Promise<ApiResponse<undefined>> {
        const inviterId = req.user.userId;
        const inviterName = req.user.email || 'Super Admin';

        await this._inviteAdminUseCase.execute(dto, inviterName, inviterId);

        return { success: true, message: RESPONSE_MESSAGES.ADMIN.ADMIN_INVITED };
    }

    @Post(API_ENDPOINTS.ADMIN.MANAGEMENT.ACCEPT_INVITE)
    @HttpCode(HttpStatus.OK)
    async acceptInvite(@Body() dto: AcceptAdminInviteDto): Promise<ApiResponse<undefined>> {
        await this._acceptInviteUseCase.execute(dto);
        return { success: true, message: RESPONSE_MESSAGES.ADMIN.INVITE_ACCEPTED };
    }

    @Post(API_ENDPOINTS.ADMIN.MANAGEMENT.REINVITE)
    @UseGuards(JwtAuthGuard, AdminSessionGuard, AdminPermissionsGuard)
    @RequirePermissions(AdminPermission.ADMINS_INVITE)
    @HttpCode(HttpStatus.OK)
    async reinviteAdmin(
        @Param('id') targetAdminId: string, 
        @Req() req: AuthenticatedRequest
    ): Promise<ApiResponse<undefined>> {
        const inviterName = req.user.email || 'Super Admin';
        await this._reinviteAdminUseCase.execute(targetAdminId, inviterName);

        return { success: true, message: RESPONSE_MESSAGES.ADMIN.REINVITE_SENT };
    }

    @Delete(API_ENDPOINTS.ADMIN.MANAGEMENT.CANCEL_INVITE)
    @UseGuards(JwtAuthGuard, AdminSessionGuard, AdminPermissionsGuard)
    @RequirePermissions(AdminPermission.ADMINS_INVITE)
    @HttpCode(HttpStatus.OK)
    async cancelAdminInvite(@Param('id') targetAdminId: string): Promise<ApiResponse<undefined>> {
        await this._cancelAdminInviteUseCase.execute(targetAdminId);
        return { success: true, message: RESPONSE_MESSAGES.ADMIN.INVITE_CANCELLED };
    }

    @Patch(API_ENDPOINTS.ADMIN.MANAGEMENT.BY_ID)
    @UseGuards(JwtAuthGuard, AdminSessionGuard, AdminPermissionsGuard)
    @RequirePermissions(AdminPermission.ADMINS_ASSIGN_PERMISSIONS)
    @HttpCode(HttpStatus.OK)
    async updateAdmin(
        @Param('id') targetAdminId: string, 
        @Body() dto: UpdateAdminDto
    ): Promise<ApiResponse<undefined>> {
        await this._updateAdminUseCase.execute(targetAdminId, dto);
        return { success: true, message: RESPONSE_MESSAGES.ADMIN.ADMIN_UPDATED };
    }

    @Patch(API_ENDPOINTS.ADMIN.MANAGEMENT.SUSPEND)
    @UseGuards(JwtAuthGuard, AdminSessionGuard, AdminPermissionsGuard)
    @RequirePermissions(AdminPermission.ADMINS_SUSPEND)
    @HttpCode(HttpStatus.OK)
    async suspendAdmin(
        @Param('id') targetAdminId: string, 
        @Body() dto: SuspendAdminDto, 
        @Req() req: AuthenticatedRequest
    ): Promise<ApiResponse<undefined>> {
        await this._suspendAdminUseCase.execute(targetAdminId, dto, req.user.userId);
        return { success: true, message: RESPONSE_MESSAGES.ADMIN.USER_SUSPENDED }; // Reuse message
    }

    @Patch(API_ENDPOINTS.ADMIN.MANAGEMENT.DEACTIVATE)
    @UseGuards(JwtAuthGuard, AdminSessionGuard, AdminPermissionsGuard)
    @RequirePermissions(AdminPermission.ADMINS_SUSPEND)
    @HttpCode(HttpStatus.OK)
    async deactivateAdmin(
        @Param('id') targetAdminId: string, 
        @Body() dto: AdminStatusReasonDto, 
        @Req() req: AuthenticatedRequest
    ): Promise<ApiResponse<undefined>> {
        await this._deactivateAdminUseCase.execute(targetAdminId, dto.reason, req.user.userId);
        return { success: true, message: RESPONSE_MESSAGES.ADMIN.ADMIN_DEACTIVATED };
    }

    @Patch(API_ENDPOINTS.ADMIN.MANAGEMENT.REACTIVATE)
    @UseGuards(JwtAuthGuard, AdminSessionGuard, AdminPermissionsGuard)
    @RequirePermissions(AdminPermission.ADMINS_SUSPEND)
    @HttpCode(HttpStatus.OK)
    async reactivateAdmin(
        @Param('id') targetAdminId: string, 
        @Body() dto: AdminStatusReasonDto, 
        @Req() req: AuthenticatedRequest
    ): Promise<ApiResponse<undefined>> {
        await this._reactivateAdminUseCase.execute(targetAdminId, dto.reason, req.user.userId);
        return { success: true, message: RESPONSE_MESSAGES.ADMIN.ADMIN_REACTIVATED };
    }

    @Post(API_ENDPOINTS.ADMIN.MANAGEMENT.FORCE_LOGOUT)
    @UseGuards(JwtAuthGuard, AdminSessionGuard, AdminPermissionsGuard)
    @RequirePermissions(AdminPermission.ADMINS_FORCE_LOGOUT)
    @HttpCode(HttpStatus.OK)
    async forceLogoutAdmin(
        @Param('id') targetAdminId: string, 
        @Req() req: AuthenticatedRequest
    ): Promise<ApiResponse<undefined>> {
        await this._forceLogoutUseCase.execute(targetAdminId, req.user.userId);
        return { success: true, message: RESPONSE_MESSAGES.ADMIN.ADMIN_LOGGED_OUT };
    }
}