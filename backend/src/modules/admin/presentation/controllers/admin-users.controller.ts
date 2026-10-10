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
import { API_ENDPOINTS } from "../../../../shared/domain/constants/api-endpoints.constant";
import { ApiResponse } from "../../../../shared/domain/interfaces/api-response.interface";
import { RESPONSE_MESSAGES } from "../../../../shared/domain/constants/response-messages.constant";
import { FacadeSuspensionUnit, FacadeUserDto, FacadeUserStatus } from "../../../users/application/interfaces/user-management-facade.interface";

@Controller(API_ENDPOINTS.ADMIN.USERS.BASE)
@UseGuards(JwtAuthGuard, AdminSessionGuard, AdminPermissionsGuard)
export class AdminUsersController {
    constructor(
        @Inject(MANAGE_USER_STATUS_USE_CASE) private readonly _manageUserStatusUseCase: IManageUserStatusUseCase,
        @Inject(GET_ADMIN_USERS_USE_CASE) private readonly _getUsersUseCase: IGetAdminUsersUseCase,
    ) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    @RequirePermissions(AdminPermission.USERS_VIEW)
    async listUsers(@Query() query: GetUsersQueryDto): Promise<ApiResponse<FacadeUserDto[]>> {
        const result = await this._getUsersUseCase.execute({
            page: query.page ?? 1,
            limit: query.limit ?? 20,
            search: query.search,
            status: query.status as FacadeUserStatus,
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

    @Get(API_ENDPOINTS.ADMIN.USERS.BY_ID)
    @HttpCode(HttpStatus.OK)
    @RequirePermissions(AdminPermission.USERS_VIEW)
    async getUserDetails(@Param('id') id: string): Promise<ApiResponse<FacadeUserDto | null>> {
        const user = await this._getUsersUseCase.getById(id);
        if (!user) {
            return { success: false, error: { code: 'NOT_FOUND', message: 'User not found' } };
        }
        return { success: true, data: user };
    }

    @Post(API_ENDPOINTS.ADMIN.USERS.SUSPEND)
    @HttpCode(HttpStatus.OK)
    @RequirePermissions(AdminPermission.USERS_SUSPEND)
    async suspendUser(
        @Param('id') targetUserId: string, 
        @Body() dto: SuspendUserDto, 
        @Req() req: AuthenticatedRequest
    ): Promise<ApiResponse<undefined>> {
        const adminId = req.user.userId;
        await this._manageUserStatusUseCase.suspendUser(adminId, targetUserId, dto.duration, dto.unit as FacadeSuspensionUnit, dto.reason);
        return { success: true, message: RESPONSE_MESSAGES.ADMIN.USER_SUSPENDED };
    }

    @Post(API_ENDPOINTS.ADMIN.USERS.UNSUSPEND)
    @HttpCode(HttpStatus.OK)
    @RequirePermissions(AdminPermission.USERS_SUSPEND)
    async unsuspendUser(
        @Param('id') targetUserId: string, 
        @Body() dto: UnSuspendUserDto, 
        @Req() req: AuthenticatedRequest
    ): Promise<ApiResponse<undefined>> {
        const adminId = req.user.userId;
        await this._manageUserStatusUseCase.unsuspendUser(adminId, targetUserId, dto.reason);
        return { success: true, message: RESPONSE_MESSAGES.ADMIN.USER_UNSUSPENDED };
    }

    @Post(API_ENDPOINTS.ADMIN.USERS.BAN)
    @HttpCode(HttpStatus.OK)
    @RequirePermissions(AdminPermission.USERS_BAN)
    async banUser(
        @Param('id') targetUserId: string, 
        @Body() dto: BanUserDto, 
        @Req() req: AuthenticatedRequest
    ): Promise<ApiResponse<undefined>> {
        const adminId = req.user.userId;
        await this._manageUserStatusUseCase.banUser(adminId, targetUserId, dto.reason);
        return { success: true, message: RESPONSE_MESSAGES.ADMIN.USER_BANNED };
    }

    @Post(API_ENDPOINTS.ADMIN.USERS.UNBAN)
    @HttpCode(HttpStatus.OK)
    @RequirePermissions(AdminPermission.USERS_BAN)
    async unbanUser(
        @Param('id') targetUserId: string, 
        @Body() dto: UnbanUserDto, 
        @Req() req: AuthenticatedRequest
    ): Promise<ApiResponse<undefined>> {
        const adminId = req.user.userId;
        await this._manageUserStatusUseCase.unbanUser(adminId, targetUserId, dto.reason);
        return { success: true, message: RESPONSE_MESSAGES.ADMIN.USER_UNBANNED };
    }
}