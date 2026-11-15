import { Inject, Injectable } from '@nestjs/common';
import { ErrorCode } from '../../../../shared/domain/enums/error-code.enum';
import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';
import { AdminAuditResourceType } from '../../domain/enums/admin-audit.enums';
import { ADMIN_AUDIT_LOG_REPOSITORY, IAdminAuditLogRepository } from '../../domain/interfaces/admin-audit-log-repository.interface';
import { GetScenarioActivityHistoryQueryDto, PaginatedAdminAuditLogsResponseDto } from '../dtos/admin-audit-log.dto';
import { IGetScenarioActivityHistoryUseCase } from '../interfaces/admin-audit.use-cases.interface';
import { AdminAuditDtoMapper } from '../mappers/admin-audit-dto.mapper';

@Injectable()
export class GetScenarioActivityHistoryUseCase implements IGetScenarioActivityHistoryUseCase {
    constructor(
        @Inject(ADMIN_AUDIT_LOG_REPOSITORY) private readonly _auditLogRepository: IAdminAuditLogRepository,
    ) { }

    async execute(
        scenarioId: string,
        query?: GetScenarioActivityHistoryQueryDto,
    ): Promise<PaginatedAdminAuditLogsResponseDto> {
        if (!scenarioId || typeof scenarioId !== 'string' || scenarioId.trim().length === 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, 'Scenario ID is required to fetch activity history.');
        }

        const result = await this._auditLogRepository.findByResource(
            AdminAuditResourceType.SCENARIO,
            scenarioId.trim(),
            query?.page,
            query?.limit,
        );

        return AdminAuditDtoMapper.toPaginatedResponseDto(result);
    }
}
