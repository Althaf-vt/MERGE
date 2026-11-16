import { Inject, Injectable } from '@nestjs/common';
import { ErrorCode } from '../../../../shared/domain/enums/error-code.enum';
import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';
import { BILLING_POLICY } from '../../domain/constants/billing.constants';
import { BILLING_ERROR_MESSAGES } from '../../domain/constants/billing-error-messages.constants';
import { IBillingTransactionRepository, BILLING_TRANSACTION_REPOSITORY } from '../../domain/interfaces/billing-transaction-repository.interface';
import { BillingHistoryQueryDto, PaginatedBillingHistoryResponseDto } from '../dtos/billing-transaction-response.dto';
import { IGetUserBillingHistoryUseCase } from '../interfaces/billing-history.use-cases.interface';
import { BillingTransactionDtoMapper } from '../mappers/billing-transaction-dto.mapper';

@Injectable()
export class GetUserBillingHistoryUseCase implements IGetUserBillingHistoryUseCase {
    constructor(
        @Inject(BILLING_TRANSACTION_REPOSITORY) private readonly _billingTransactionRepository: IBillingTransactionRepository,
    ) { }

    async execute(userId: string, query?: BillingHistoryQueryDto): Promise<PaginatedBillingHistoryResponseDto> {
        if (!userId || userId.trim().length === 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.USER_ID_REQUIRED);
        }

        const trimmedUserId = userId.trim();
        const page = Math.max(1, query?.page ?? BILLING_POLICY.PAGINATION.DEFAULT_PAGE);
        const limit = Math.min(
            BILLING_POLICY.PAGINATION.MAX_LIMIT,
            Math.max(1, query?.limit ?? BILLING_POLICY.PAGINATION.DEFAULT_LIMIT),
        );

        if (query?.type || query?.status) {
            const result = await this._billingTransactionRepository.findAll({
                userId: trimmedUserId,
                type: query.type,
                status: query.status,
                page,
                limit,
            });

            return BillingTransactionDtoMapper.toPaginatedResponseDto(result.items, result.total, page, limit);
        }

        const result = await this._billingTransactionRepository.findByUserId(trimmedUserId, { page, limit });
        return BillingTransactionDtoMapper.toPaginatedResponseDto(result.items, result.total, page, limit);
    }
}
