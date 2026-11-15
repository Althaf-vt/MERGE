import { AdminAuditLog } from '../entities/admin-audit-log.entity';
import { AdminAuditAction, AdminAuditResourceType } from '../enums/admin-audit.enums';

export const ADMIN_AUDIT_LOG_REPOSITORY = 'ADMIN_AUDIT_LOG_REPOSITORY';

export interface GetAdminAuditLogsFilters {
    page?: number;
    limit?: number;
    resourceType?: AdminAuditResourceType;
    resourceId?: string;
    action?: AdminAuditAction;
    adminId?: string;
    startDate?: Date;
    endDate?: Date;
}

export interface PaginatedAdminAuditLogsResult {
    data: AdminAuditLog[];
    total: number;
    page: number;
    limit: number;
}

export interface IAdminAuditLogRepository {
    save(log: AdminAuditLog): Promise<AdminAuditLog>;
    findById(id: string): Promise<AdminAuditLog | null>;
    findAllPaginated(filters: GetAdminAuditLogsFilters): Promise<PaginatedAdminAuditLogsResult>;
    findByResource(
        resourceType: AdminAuditResourceType,
        resourceId: string,
        page?: number,
        limit?: number,
    ): Promise<PaginatedAdminAuditLogsResult>;
}
