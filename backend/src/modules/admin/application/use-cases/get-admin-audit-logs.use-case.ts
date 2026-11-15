import { Inject, Injectable } from '@nestjs/common';
import { ADMIN_AUDIT_LOG_REPOSITORY, IAdminAuditLogRepository } from '../../domain/interfaces/admin-audit-log-repository.interface';
import { GetAdminAuditLogsQueryDto, PaginatedAdminAuditLogsResponseDto } from '../dtos/admin-audit-log.dto';
import { IGetAdminAuditLogsUseCase } from '../interfaces/admin-audit.use-cases.interface';
import { AdminAuditDtoMapper } from '../mappers/admin-audit-dto.mapper';

@Injectable()
export class GetAdminAuditLogsUseCase implements IGetAdminAuditLogsUseCase {
    constructor(
        @Inject(ADMIN_AUDIT_LOG_REPOSITORY) private readonly _auditLogRepository: IAdminAuditLogRepository,
    ) { }

    async execute(query: GetAdminAuditLogsQueryDto): Promise<PaginatedAdminAuditLogsResponseDto> {
        const result = await this._auditLogRepository.findAllPaginated({
            page: query.page,
            limit: query.limit,
            resourceType: query.resourceType,
            resourceId: query.resourceId,
            action: query.action,
            adminId: query.adminId,
            startDate: query.startDate ? new Date(query.startDate) : undefined,
            endDate: query.endDate ? new Date(query.endDate) : undefined,
        });

        return AdminAuditDtoMapper.toPaginatedResponseDto(result);
    }
}
