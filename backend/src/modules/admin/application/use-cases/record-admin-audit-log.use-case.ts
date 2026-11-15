import { Inject, Injectable } from '@nestjs/common';
import { AdminAuditLog } from '../../domain/entities/admin-audit-log.entity';
import { ADMIN_AUDIT_LOG_REPOSITORY, IAdminAuditLogRepository } from '../../domain/interfaces/admin-audit-log-repository.interface';
import { AdminAuditLogResponseDto, RecordAdminAuditLogDto } from '../dtos/admin-audit-log.dto';
import { IRecordAdminAuditLogUseCase } from '../interfaces/admin-audit.use-cases.interface';
import { AdminAuditDtoMapper } from '../mappers/admin-audit-dto.mapper';

@Injectable()
export class RecordAdminAuditLogUseCase implements IRecordAdminAuditLogUseCase {
    constructor(
        @Inject(ADMIN_AUDIT_LOG_REPOSITORY) private readonly _auditLogRepository: IAdminAuditLogRepository,
    ) { }

    async execute(dto: RecordAdminAuditLogDto): Promise<AdminAuditLogResponseDto> {
        const auditLog = AdminAuditLog.create({
            adminId: dto.adminId,
            adminEmail: dto.adminEmail,
            adminName: dto.adminName,
            action: dto.action,
            resourceType: dto.resourceType,
            resourceId: dto.resourceId,
            details: dto.details,
            ipAddress: dto.ipAddress,
            userAgent: dto.userAgent,
        });

        const savedLog = await this._auditLogRepository.save(auditLog);
        return AdminAuditDtoMapper.toResponseDto(savedLog);
    }
}
