import { Inject, Injectable } from '@nestjs/common';
import { BILLING_POLICY } from '../../domain/constants/billing.constants';
import { IBillingTransactionRepository, BILLING_TRANSACTION_REPOSITORY } from '../../domain/interfaces/billing-transaction-repository.interface';
import { AdminBillingHistoryQueryDto, PaginatedBillingHistoryResponseDto } from '../dtos/billing-transaction-response.dto';
import { IGetAdminBillingHistoryUseCase } from '../interfaces/billing-history.use-cases.interface';
import { BillingTransactionDtoMapper } from '../mappers/billing-transaction-dto.mapper';

@Injectable()
export class GetAdminBillingHistoryUseCase implements IGetAdminBillingHistoryUseCase {
    constructor(
        @Inject(BILLING_TRANSACTION_REPOSITORY) private readonly _billingTransactionRepository: IBillingTransactionRepository,
    ) { }

    async execute(query?: AdminBillingHistoryQueryDto): Promise<PaginatedBillingHistoryResponseDto> {
        const page = Math.max(1, query?.page ?? BILLING_POLICY.PAGINATION.DEFAULT_PAGE);
        const limit = Math.min(
            BILLING_POLICY.PAGINATION.MAX_LIMIT,
            Math.max(1, query?.limit ?? BILLING_POLICY.PAGINATION.DEFAULT_LIMIT),
        );

        const result = await this._billingTransactionRepository.findAll({
            userId: query?.userId?.trim() || undefined,
            type: query?.type,
            status: query?.status,
            fromDate: query?.fromDate,
            toDate: query?.toDate,
            page,
            limit,
        });

        return BillingTransactionDtoMapper.toPaginatedResponseDto(result.items, result.total, page, limit);
    }
}
