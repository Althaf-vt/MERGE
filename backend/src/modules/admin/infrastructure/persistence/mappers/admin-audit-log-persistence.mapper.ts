import { AdminAuditLog } from '../../../domain/entities/admin-audit-log.entity';
import { AdminAuditAction, AdminAuditResourceType } from '../../../domain/enums/admin-audit.enums';
import { AdminAuditLogDocument } from '../admin-audit-log.schema';

export class AdminAuditLogPersistenceMapper {
    public static toDomain(raw: AdminAuditLogDocument): AdminAuditLog {
        return AdminAuditLog.restore({
            id: raw._id.toString(),
            adminId: raw.adminId,
            adminEmail: raw.adminEmail ?? undefined,
            adminName: raw.adminName ?? undefined,
            action: raw.action as AdminAuditAction,
            resourceType: raw.resourceType as AdminAuditResourceType,
            resourceId: raw.resourceId,
            details: raw.details as Record<string, unknown> | undefined,
            ipAddress: raw.ipAddress ?? undefined,
            userAgent: raw.userAgent ?? undefined,
            createdAt: raw.createdAt,
        });
    }

    public static toDomainList(documents: AdminAuditLogDocument[]): AdminAuditLog[] {
        return documents.map((doc) => AdminAuditLogPersistenceMapper.toDomain(doc));
    }

    public static toPersistence(entity: AdminAuditLog): Record<string, unknown> {
        return {
            adminId: entity.adminId,
            adminEmail: entity.adminEmail ?? null,
            adminName: entity.adminName ?? null,
            action: entity.action,
            resourceType: entity.resourceType,
            resourceId: entity.resourceId,
            details: entity.details ?? null,
            ipAddress: entity.ipAddress ?? null,
            userAgent: entity.userAgent ?? null,
            createdAt: entity.createdAt,
        };
    }
}
