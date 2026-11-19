import { Controller, Get, HttpCode, HttpStatus, Inject, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../shared/infrastructure/security/guards/jwt-auth.guard';
import { AdminSessionGuard } from '../../infrastructure/security/guards/admin-session.guard';
import { AdminPermissionsGuard } from '../../../../shared/infrastructure/security/guards/admin-permissions.guard';
import { RequirePermissions } from '../../../../shared/infrastructure/security/decorators/require-permissions.decorator';
import { AdminPermission } from '../../../../shared/domain/enums/admin-rbac.enums';
import { API_ENDPOINTS } from '../../../../shared/presentation/constants/api-endpoints.constant';
import { ApiResponse } from '../../../../shared/presentation/interfaces/api-response.interface';
import { RESPONSE_MESSAGES } from '../../../../shared/presentation/constants/response-messages.constant';
import { ApiResponseHelper } from '../../../../shared/presentation/utils/api-response.helper';
import { GET_ADMIN_AUDIT_LOGS_USE_CASE, IGetAdminAuditLogsUseCase } from '../../application/interfaces/admin-audit.use-cases.interface';
import { AdminAuditLogResponseDto, GetAdminAuditLogsQueryDto } from '../../application/dtos/admin-audit-log.dto';

@Controller(API_ENDPOINTS.ADMIN.AUDIT_LOGS.BASE)
@UseGuards(JwtAuthGuard, AdminSessionGuard, AdminPermissionsGuard)
export class AdminAuditLogController {
    constructor(
        @Inject(GET_ADMIN_AUDIT_LOGS_USE_CASE)
        private readonly _getAdminAuditLogsUseCase: IGetAdminAuditLogsUseCase,
    ) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    @RequirePermissions(AdminPermission.AUDIT_LOGS_VIEW)
    async getAuditLogs(
        @Query() query: GetAdminAuditLogsQueryDto,
    ): Promise<ApiResponse<AdminAuditLogResponseDto[]>> {
        const result = await this._getAdminAuditLogsUseCase.execute(query);
        return ApiResponseHelper.success(
            RESPONSE_MESSAGES.ADMIN.AUDIT_LOGS_FETCHED,
            result.data,
            {
                total: result.total,
                page: result.page,
                limit: result.limit,
            },
        );
    }
}
