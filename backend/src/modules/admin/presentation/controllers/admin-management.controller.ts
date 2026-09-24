import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ACCEPT_ADMIN_INVITE_USE_CASE, IAcceptAdminInviteUseCase, IInviteAdminUseCase, INVITE_ADMIN_USE_CASE, IUpdateAdminUseCase, UPDATE_ADMIN_USE_CASE } from "../../application/interfaces/admin-management.use-case.interface";
import { JwtAuthGuard } from "../../../../shared/infrastructure/security/guards/jwt-auth.guard";
import { AdminPermissionsGuard } from "../../../../shared/infrastructure/security/guards/admin-permissions.guard";
import { RequirePermissions } from "../../../../shared/infrastructure/security/decorators/require-permissions.decorator";
import { AdminPermission } from "../../domain/enums/admin-permission.enums";
import { AcceptAdminInviteDto, InviteAdminDto, UpdateAdminDto } from "../../application/dtos/admin-management.dto";
import { AuthenticatedRequest } from "../../../../shared/infrastructure/security/interfaces/authenticated-request.interface";
import { GET_ADMINS_USE_CASE, IGetAdminsUseCase } from "../../application/interfaces/get-admins.use-case.interface";
import { GetAdminsDto } from "../../application/dtos/get-admins.dto";
import { IReactivateAdminUseCase, ISuspendAdminUseCase, REACTIVATE_ADMIN_USE_CASE, SUSPEND_ADMIN_USE_CASE } from "../../application/interfaces/admin-status.use-case.interface";

@Controller('admin/management')
export class AdminManagementController {
    constructor(
        @Inject(INVITE_ADMIN_USE_CASE) private readonly _inviteAdminUseCase: IInviteAdminUseCase,
        @Inject(ACCEPT_ADMIN_INVITE_USE_CASE) private readonly _acceptInviteUseCase: IAcceptAdminInviteUseCase,
        @Inject(UPDATE_ADMIN_USE_CASE) private readonly _updateAdminUseCase: IUpdateAdminUseCase,
        @Inject(GET_ADMINS_USE_CASE) private readonly _getAdminsUseCase: IGetAdminsUseCase,
        @Inject(SUSPEND_ADMIN_USE_CASE) private readonly _suspendAdminUseCase: ISuspendAdminUseCase,
        @Inject(REACTIVATE_ADMIN_USE_CASE) private readonly _reactivateAdminUseCase: IReactivateAdminUseCase,
    ) { }

    @Get()
    @UseGuards(JwtAuthGuard, AdminPermissionsGuard)
    @RequirePermissions(AdminPermission.ADMINS_VIEW)
    @HttpCode(HttpStatus.OK)
    async getAdmins(@Query() query: GetAdminsDto) {
        const result = await this._getAdminsUseCase.execute(query);

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
    async suspendAdmin(@Param('id') targetAdminId: string){
        await this._suspendAdminUseCase.execute(targetAdminId);
        return { success: true, message: 'Admin account suspended successfully.' };
    }

    @Patch(':id/reactivate')
    @UseGuards(JwtAuthGuard, AdminPermissionsGuard)
    @RequirePermissions(AdminPermission.ADMINS_SUSPEND)
    @HttpCode(HttpStatus.OK)
    async reactivateAdmin(@Param('id') targetAdminId: string) {
        await this._reactivateAdminUseCase.execute(targetAdminId);
        return { success: true, message: 'Admin account reactivated successfully.' };
    }
}