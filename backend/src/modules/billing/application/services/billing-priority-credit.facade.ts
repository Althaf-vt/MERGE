import { Inject, Injectable } from '@nestjs/common';
import { IBillingFacade } from '../../../connections/application/interfaces/billing-facade.interface';
import { BILLING_POLICY, BILLING_TRANSACTION_DESCRIPTIONS } from '../../domain/constants/billing.constants';
import { DEDUCT_PRIORITY_CREDIT_USE_CASE, GET_USER_CREDIT_BALANCE_USE_CASE, IDeductPriorityCreditUseCase, IGetUserCreditBalanceUseCase } from '../interfaces/credit.use-cases.interface';
import { IBillingPriorityCreditFacade } from '../interfaces/billing-facades.interface';

@Injectable()
export class BillingPriorityCreditFacade implements IBillingPriorityCreditFacade, IBillingFacade {
    constructor(
        @Inject(DEDUCT_PRIORITY_CREDIT_USE_CASE) private readonly _deductPriorityCreditUseCase: IDeductPriorityCreditUseCase,
        @Inject(GET_USER_CREDIT_BALANCE_USE_CASE) private readonly _getUserCreditBalanceUseCase: IGetUserCreditBalanceUseCase,
    ) { }

    async deductPriorityCredit(userId: string, reason?: string, referenceId?: string): Promise<void> {
        await this._deductPriorityCreditUseCase.execute(
            userId,
            reason ?? BILLING_TRANSACTION_DESCRIPTIONS.PRIORITY_INTRO_SPEND,
            referenceId,
        );
    }

    async hasEnoughCredits(
        userId: string,
        amount: number = BILLING_POLICY.PRIORITY_INTRO_CREDIT_COST,
    ): Promise<boolean> {
        if (!userId || userId.trim().length === 0) {
            return false;
        }

        const balanceDto = await this._getUserCreditBalanceUseCase.execute(userId.trim());
        return balanceDto.balance >= amount;
    }

    async getCreditBalance(userId: string): Promise<number> {
        if (!userId || userId.trim().length === 0) {
            return 0;
        }

        const balanceDto = await this._getUserCreditBalanceUseCase.execute(userId.trim());
        return balanceDto.balance;
    }
}
