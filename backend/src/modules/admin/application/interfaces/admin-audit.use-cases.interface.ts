import { AdminAuditLogResponseDto, GetAdminAuditLogsQueryDto, GetScenarioActivityHistoryQueryDto, PaginatedAdminAuditLogsResponseDto, RecordAdminAuditLogDto } from '../dtos/admin-audit-log.dto';

export const RECORD_ADMIN_AUDIT_LOG_USE_CASE = 'RECORD_ADMIN_AUDIT_LOG_USE_CASE';
export const GET_ADMIN_AUDIT_LOGS_USE_CASE = 'GET_ADMIN_AUDIT_LOGS_USE_CASE';
export const GET_SCENARIO_ACTIVITY_HISTORY_USE_CASE = 'GET_SCENARIO_ACTIVITY_HISTORY_USE_CASE';

export interface IRecordAdminAuditLogUseCase {
    execute(dto: RecordAdminAuditLogDto): Promise<AdminAuditLogResponseDto>;
}

export interface IGetAdminAuditLogsUseCase {
    execute(query: GetAdminAuditLogsQueryDto): Promise<PaginatedAdminAuditLogsResponseDto>;
}

export interface IGetScenarioActivityHistoryUseCase {
    execute(
        scenarioId: string,
        query?: GetScenarioActivityHistoryQueryDto,
    ): Promise<PaginatedAdminAuditLogsResponseDto>;
}
