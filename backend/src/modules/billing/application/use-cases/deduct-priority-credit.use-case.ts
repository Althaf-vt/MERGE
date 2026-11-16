import { Inject, Injectable } from '@nestjs/common';
import { ErrorCode } from '../../../../shared/domain/enums/error-code.enum';
import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';
import { BILLING_ERROR_MESSAGES } from '../../domain/constants/billing-error-messages.constants';
import { BILLING_ID_PREFIXES, BILLING_POLICY, BILLING_TRANSACTION_DESCRIPTIONS, generateBillingId } from '../../domain/constants/billing.constants';
import { BillingTransaction } from '../../domain/entities/billing-transaction.entity';
import { BILLING_TRANSACTION_REPOSITORY, IBillingTransactionRepository } from '../../domain/interfaces/billing-transaction-repository.interface';
import { CREDIT_ACCOUNT_REPOSITORY, ICreditAccountRepository } from '../../domain/interfaces/credit-account-repository.interface';
import { CreditBalanceResponseDto } from '../dtos/credit-balance-response.dto';
import { IDeductPriorityCreditUseCase } from '../interfaces/credit.use-cases.interface';
import { CreditAccountDtoMapper } from '../mappers/credit-account-dto.mapper';

@Injectable()
export class DeductPriorityCreditUseCase implements IDeductPriorityCreditUseCase {
    constructor(
        @Inject(CREDIT_ACCOUNT_REPOSITORY) private readonly _creditAccountRepository: ICreditAccountRepository,
        @Inject(BILLING_TRANSACTION_REPOSITORY) private readonly _billingTransactionRepository: IBillingTransactionRepository,
    ) { }

    async execute(userId: string, reason?: string, referenceId?: string): Promise<CreditBalanceResponseDto> {
        if (!userId || userId.trim().length === 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.USER_ID_REQUIRED);
        }

        const cost = BILLING_POLICY.PRIORITY_INTRO_CREDIT_COST;
        const account = await this._creditAccountRepository.getOrCreate(userId.trim());

        if (!account.hasSufficientBalance(cost)) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.INSUFFICIENT_CREDITS);
        }

        const description = reason?.trim() || BILLING_TRANSACTION_DESCRIPTIONS.PRIORITY_INTRO_SPEND;

        account.deduct({
            amount: cost,
            reason: description,
            referenceId,
        });

        const transaction = BillingTransaction.createCreditSpend({
            id: generateBillingId(BILLING_ID_PREFIXES.TRANSACTION),
            userId: account.userId,
            creditsDeducted: cost,
            description,
            referenceId: referenceId ?? null,
        });

        await Promise.all([
            this._creditAccountRepository.update(account),
            this._billingTransactionRepository.create(transaction),
        ]);

        return CreditAccountDtoMapper.toResponseDto(account);
    }
}
