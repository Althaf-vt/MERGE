import { Body, Controller, HttpCode, HttpStatus, Inject, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { ACCEPT_ADMIN_INVITE_USE_CASE, IAcceptAdminInviteUseCase, IInviteAdminUseCase, INVITE_ADMIN_USE_CASE, IUpdateAdminUseCase, UPDATE_ADMIN_USE_CASE } from "../../application/interfaces/admin-management.use-case.interface";
import { JwtAuthGuard } from "../../../../shared/infrastructure/security/guards/jwt-auth.guard";
import { AdminPermissionsGuard } from "../../../../shared/infrastructure/security/guards/admin-permissions.guard";
import { RequirePermissions } from "../../../../shared/infrastructure/security/decorators/require-permissions.decorator";
import { AdminPermission } from "../../domain/enums/admin-permission.enums";
import { AcceptAdminInviteDto, InviteAdminDto, UpdateAdminDto } from "../../application/dtos/admin-management.dto";
import { AuthenticatedRequest } from "../../../../shared/infrastructure/security/interfaces/authenticated-request.interface";

@Controller('admin/management')
export class AdminManagementController {
    constructor(
        @Inject(INVITE_ADMIN_USE_CASE) private readonly _inviteAdminUseCase: IInviteAdminUseCase,
        @Inject(ACCEPT_ADMIN_INVITE_USE_CASE) private readonly _acceptInviteUseCase: IAcceptAdminInviteUseCase,
        @Inject(UPDATE_ADMIN_USE_CASE) private readonly _updateAdminUseCase: IUpdateAdminUseCase,
    ) { }

    @Post('invite')
    @UseGuards(JwtAuthGuard, AdminPermissionsGuard)
    @RequirePermissions(AdminPermission.ADMINS_INVITE)
    @HttpCode(HttpStatus.CREATED)
    async inviteAdmin(@Body() dto: InviteAdminDto, @Req() req: AuthenticatedRequest){
        const inviterId = req.user.userId;
        // pluck the inviters email from the JWT payload to display in the email template
        const inviterName = (req.user as any).email || 'Super Admin';

        await this._inviteAdminUseCase.execute(dto, inviterName, inviterId);

        return {success: true, message: 'Admin invitation sent successfully.'};
    }

    @Post('accept-invite')
    @HttpCode(HttpStatus.OK)
    async acceptInvite(@Body() dto: AcceptAdminInviteDto){
        // this is a public route , security is enforced strictly via the Redis token
        await this._acceptInviteUseCase.execute(dto);

        return {success: true, message: 'Account activated successfully. You may now log in.'};
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, AdminPermissionsGuard)
    @RequirePermissions(AdminPermission.ADMINS_ASSIGN_PERMISSIONS)
    @HttpCode(HttpStatus.OK)
    async updateAdmin(@Param('id') targetAdminId: string, @Body() dto: UpdateAdminDto){
        await this._updateAdminUseCase.execute(targetAdminId, dto);

        return {success: true, message: 'Admin account updated successfully.'};
    }
}