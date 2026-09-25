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

@Controller('admin/management')
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
    @UseGuards(JwtAuthGuard, AdminPermissionsGuard)
    @RequirePermissions(AdminPermission.ADMINS_VIEW)
    @HttpCode(HttpStatus.OK)
    async getAdmins(@Query() query: GetAdminsDto, @Req() req: AuthenticatedRequest) {
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

    @Get(':id')
    @UseGuards(JwtAuthGuard, AdminPermissionsGuard)
    @RequirePermissions(AdminPermission.ADMINS_VIEW)
    @HttpCode(HttpStatus.OK)
    async getAdminDetails(@Param('id') targetAdminId: string) {
        const data = await this._getAdminDetailsUseCase.execute(targetAdminId);
        return { success: true, data }
    }

    @Post('invite')
    @UseGuards(JwtAuthGuard, AdminPermissionsGuard)
    @RequirePermissions(AdminPermission.ADMINS_INVITE)
    @HttpCode(HttpStatus.CREATED)
    async inviteAdmin(@Body() dto: InviteAdminDto, @Req() req: AuthenticatedRequest) {
        const inviterId = req.user.userId;
        // pluck the inviters email from the JWT payload to display in the email template
        const inviterName = (req.user as any).email || 'Super Admin';

        await this._inviteAdminUseCase.execute(dto, inviterName, inviterId);

        return { success: true, message: 'Admin invitation sent successfully.' };
    }

    @Post('accept-invite')
    @HttpCode(HttpStatus.OK)
    async acceptInvite(@Body() dto: AcceptAdminInviteDto) {
        // this is a public route , security is enforced strictly via the Redis token
        await this._acceptInviteUseCase.execute(dto);

        return { success: true, message: 'Account activated successfully. You may now log in.' };
    }

    @Post(':id/reinvite')
    @UseGuards(JwtAuthGuard, AdminPermissionsGuard)
    @RequirePermissions(AdminPermission.ADMINS_INVITE)
    @HttpCode(HttpStatus.OK)
    async reinviteAdmin(@Param('id') targetAdminId: string, @Req() req: AuthenticatedRequest) {
        const inviterName = (req.user as any).email || 'Super Admin';
        await this._reinviteAdminUseCase.execute(targetAdminId, inviterName);

        return { success: true, message: 'New invitation link sent successfully.' };
    }

    @Delete(':id/cancel-invite')
    @UseGuards(JwtAuthGuard, AdminPermissionsGuard)
    @RequirePermissions(AdminPermission.ADMINS_INVITE)
    @HttpCode(HttpStatus.OK)
    async cancelAdminInvite(@Param('id') targetAdminid: string) {
        await this._cancelAdminInviteUseCase.execute(targetAdminid);

        return { success: true, message: 'Pending invitation successfully cancelled.' }
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, AdminPermissionsGuard)
    @RequirePermissions(AdminPermission.ADMINS_ASSIGN_PERMISSIONS)
    @HttpCode(HttpStatus.OK)
    async updateAdmin(@Param('id') targetAdminId: string, @Body() dto: UpdateAdminDto) {
        await this._updateAdminUseCase.execute(targetAdminId, dto);

        return { success: true, message: 'Admin account updated successfully.' };
    }

    @Patch(':id/suspend')
    @UseGuards(JwtAuthGuard, AdminPermissionsGuard)
    @RequirePermissions(AdminPermission.ADMINS_SUSPEND)
    @HttpCode(HttpStatus.OK)
    async suspendAdmin(@Param('id') targetAdminId: string, @Body() dto: SuspendAdminDto, @Req() req: AuthenticatedRequest) {
        await this._suspendAdminUseCase.execute(targetAdminId, dto, req.user.userId);
        return { success: true, message: 'Admin account suspended successfully.' };
    }

    @Patch(':id/deactivate')
    @UseGuards(JwtAuthGuard, AdminPermissionsGuard)
    @RequirePermissions(AdminPermission.ADMINS_SUSPEND)
    @HttpCode(HttpStatus.OK)
    async deactivateAdmin(@Param('id') targetAdminId: string, @Body() dto: AdminStatusReasonDto, @Req() req: AuthenticatedRequest) {
        await this._deactivateAdminUseCase.execute(targetAdminId, dto.reason, req.user.userId);
        return { success: true, message: 'Admin account permanently deactivated.' };
    }

    @Patch(':id/reactivate')
    @UseGuards(JwtAuthGuard, AdminPermissionsGuard)
    @RequirePermissions(AdminPermission.ADMINS_SUSPEND)
    @HttpCode(HttpStatus.OK)
    async reactivateAdmin(@Param('id') targetAdminId: string, @Body() dto: AdminStatusReasonDto, @Req() req: AuthenticatedRequest) {
        await this._reactivateAdminUseCase.execute(targetAdminId, dto.reason, req.user.userId);
        return { success: true, message: 'Admin account reactivated successfully.' };
    }

    @Post(':id/force-logout')
    @UseGuards(JwtAuthGuard, AdminPermissionsGuard)
    @RequirePermissions(AdminPermission.ADMINS_FORCE_LOGOUT)
    @HttpCode(HttpStatus.OK)
    async forceLogoutAdmin(@Param('id') targetAdminId: string, @Req() req: AuthenticatedRequest){
        await this._forceLogoutUseCase.execute(targetAdminId, req.user.userId);
        return {success: true, message: 'Admin personnel forcefully logged out.'};
    }
}