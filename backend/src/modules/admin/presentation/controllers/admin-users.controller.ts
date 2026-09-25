import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../../../shared/infrastructure/security/guards/jwt-auth.guard";
import { IManageUserStatusUseCase, MANAGE_USER_STATUS_USE_CASE } from "../../application/interfaces/manage-user-status.use-case.interface";
import { GET_ADMIN_USERS_USE_CASE, IGetAdminUsersUseCase } from "../../application/interfaces/get-admin-users.use-case.interface";
import { RequirePermissions } from "../../../../shared/infrastructure/security/decorators/require-permissions.decorator";
import { AdminPermission } from "../../domain/enums/admin-permission.enums";
import { BanUserDto, GetUsersQueryDto, SuspendUserDto, UnbanUserDto, UnSuspendUserDto } from "../../application/dtos/user-management.dto";
import { AdminPermissionsGuard } from "../../../../shared/infrastructure/security/guards/admin-permissions.guard";
import { AuthenticatedRequest } from "../../../../shared/infrastructure/security/interfaces/authenticated-request.interface";
import { AdminSessionGuard } from "../../infrastructure/security/guards/admin-session.guard";

@Controller('admin/users')
@UseGuards(JwtAuthGuard, AdminSessionGuard, AdminPermissionsGuard)
export class AdminUsersController {
    constructor(
        @Inject(MANAGE_USER_STATUS_USE_CASE) 
        private readonly _manageUserStatusUseCase: IManageUserStatusUseCase,
        @Inject(GET_ADMIN_USERS_USE_CASE) 
        private readonly _getUsersUseCase: IGetAdminUsersUseCase,
    ) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    @RequirePermissions(AdminPermission.USERS_VIEW)
    async listUsers(@Query() query: GetUsersQueryDto) {
        const result = await this._getUsersUseCase.execute({
            page: query.page ?? 1,
            limit: query.limit ?? 20,
            search: query.search,
            status: query.status as any,
            kycStatus: query.kycStatus,
        });

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
    @HttpCode(HttpStatus.OK)
    @RequirePermissions(AdminPermission.USERS_VIEW)
    async getUserDetails(@Param('id') id: string) {
        const user = await this._getUsersUseCase.getById(id);
        if (!user) {
            return { success: false, message: 'User not found' };
        }
        return { success: true, data: user };
    }

    @Post(':id/suspend')
    @HttpCode(HttpStatus.OK)
    @RequirePermissions(AdminPermission.USERS_SUSPEND)
    async suspendUser(@Param('id') targetUserId: string, @Body() dto: SuspendUserDto, @Req() req: AuthenticatedRequest) {
        const adminId = req.user.userId;
        await this._manageUserStatusUseCase.suspendUser(adminId, targetUserId, dto.duration, dto.unit as any, dto.reason);
        return { success: true, message: 'User suspended successfully' };
    }

    @Post(':id/unsuspend')
    @HttpCode(HttpStatus.OK)
    @RequirePermissions(AdminPermission.USERS_SUSPEND)
    async unsuspendUser(@Param('id') targetUserId: string, @Body() dto: UnSuspendUserDto, @Req() req: AuthenticatedRequest) {
        const adminId = req.user.userId;
        await this._manageUserStatusUseCase.unsuspendUser(adminId, targetUserId, dto.reason);
        return { success: true, message: 'User suspension lifted' };
    }

    @Post(':id/ban')
    @HttpCode(HttpStatus.OK)
    @RequirePermissions(AdminPermission.USERS_BAN)
    async banUser(@Param('id') targetUserId: string, @Body() dto: BanUserDto, @Req() req: AuthenticatedRequest) {
        const adminId = req.user.userId;
        await this._manageUserStatusUseCase.banUser(adminId, targetUserId, dto.reason);
        return { success: true, message: 'User permanently banned.' };
    }

    @Post(':id/unban')
    @HttpCode(HttpStatus.OK)
    @RequirePermissions(AdminPermission.USERS_BAN)
    async unbanUser(@Param('id') targetUserId: string, @Body() dto: UnbanUserDto, @Req() req: AuthenticatedRequest) {
        const adminId = req.user.userId;
        await this._manageUserStatusUseCase.unbanUser(adminId, targetUserId, dto.reason);
        return { success: true, message: 'User ban reversed.' };
    }
}