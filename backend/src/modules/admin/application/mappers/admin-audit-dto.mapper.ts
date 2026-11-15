import { AdminAuditLog } from '../../domain/entities/admin-audit-log.entity';
import { PaginatedAdminAuditLogsResult } from '../../domain/interfaces/admin-audit-log-repository.interface';
import { AdminAuditLogResponseDto, PaginatedAdminAuditLogsResponseDto } from '../dtos/admin-audit-log.dto';

export class AdminAuditDtoMapper {
    public static toResponseDto(entity: AdminAuditLog): AdminAuditLogResponseDto {
        return {
            id: entity.id ?? '',
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

    public static toResponseDtoList(entities: AdminAuditLog[]): AdminAuditLogResponseDto[] {
        return entities.map((entity) => AdminAuditDtoMapper.toResponseDto(entity));
    }

    public static toPaginatedResponseDto(result: PaginatedAdminAuditLogsResult): PaginatedAdminAuditLogsResponseDto {
        return {
            data: AdminAuditDtoMapper.toResponseDtoList(result.data),
            total: result.total,
            page: result.page,
            limit: result.limit,
        };
    }
}
