import { Inject, Injectable } from '@nestjs/common';
import { ErrorCode } from '../../../../shared/domain/enums/error-code.enum';
import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';
import { BILLING_ERROR_MESSAGES } from '../../domain/constants/billing-error-messages.constants';
import { BILLING_ID_PREFIXES, generateBillingId } from '../../domain/constants/billing.constants';
import { BillingTransaction } from '../../domain/entities/billing-transaction.entity';
import { UserSubscription } from '../../domain/entities/user-subscription.entity';
import { PaymentEnvironment } from '../../domain/enums/billing.enums';
import { BILLING_TRANSACTION_REPOSITORY, IBillingTransactionRepository } from '../../domain/interfaces/billing-transaction-repository.interface';
import { ISubscriptionPlanRepository, SUBSCRIPTION_PLAN_REPOSITORY } from '../../domain/interfaces/subscription-plan-repository.interface';
import { IUserSubscriptionRepository, USER_SUBSCRIPTION_REPOSITORY } from '../../domain/interfaces/user-subscription-repository.interface';
import { PlanBillingPeriod } from '../../domain/value-objects/plan-billing-period.vo';
import { SubscribePlanDto } from '../dtos/subscribe-plan.dto';
import { UserSubscriptionResponseDto } from '../dtos/user-subscription-response.dto';
import { ISubscribeUserUseCase } from '../interfaces/subscription-lifecycle.use-cases.interface';
import { SubscriptionDtoMapper } from '../mappers/subscription-dto.mapper';

@Injectable()
export class SubscribeUserUseCase implements ISubscribeUserUseCase {
    constructor(
        @Inject(USER_SUBSCRIPTION_REPOSITORY) private readonly _userSubscriptionRepository: IUserSubscriptionRepository,
        @Inject(SUBSCRIPTION_PLAN_REPOSITORY) private readonly _subscriptionPlanRepository: ISubscriptionPlanRepository,
        @Inject(BILLING_TRANSACTION_REPOSITORY) private readonly _billingTransactionRepository: IBillingTransactionRepository,
    ) { }

    async execute(userId: string, dto: SubscribePlanDto): Promise<UserSubscriptionResponseDto> {
        if (!userId || userId.trim().length === 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.USER_ID_REQUIRED);
        }

        if (!dto.planId || dto.planId.trim().length === 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.PLAN_ID_REQUIRED);
        }

        const now = new Date();
        const plan = await this._subscriptionPlanRepository.findById(dto.planId.trim());
        if (!plan) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.PLAN_NOT_FOUND);
        }

        if (!plan.isActive) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.PLAN_INACTIVE);
        }

        const activeSub = await this._userSubscriptionRepository.findActiveByUserId(userId.trim());
        if (activeSub && activeSub.isActive(now)) {
            throw new DomainException(
                ErrorCode.VALIDATION_FAILED,
                BILLING_ERROR_MESSAGES.SUBSCRIPTION_ALREADY_ACTIVE,
            );
        }

        const periodEnd = PlanBillingPeriod.create(plan.billingPeriod).calculatePeriodEnd(now);

        const subscription = UserSubscription.subscribe({
            id: generateBillingId(BILLING_ID_PREFIXES.SUBSCRIPTION),
            userId: userId.trim(),
            planId: plan.id,
            periodStart: now,
            periodEnd,
            autoRenew: dto.autoRenew ?? true,
            paymentMethodRef: dto.paymentMethodRef?.trim(),
            entitlements: plan.entitlements,
        });

        const effectivePrice = plan.calculateEffectivePrice(now);
        const transaction = BillingTransaction.createSubscriptionPurchase({
            id: generateBillingId(BILLING_ID_PREFIXES.TRANSACTION),
            userId: userId.trim(),
            planId: plan.id,
            planName: plan.name,
            price: effectivePrice,
            gatewayPaymentId: dto.paymentMethodRef?.trim() ?? null,
            environment: PaymentEnvironment.TEST,
        });

        const [savedSubscription] = await Promise.all([
            this._userSubscriptionRepository.create(subscription),
            this._billingTransactionRepository.create(transaction),
        ]);

        return SubscriptionDtoMapper.toResponseDto(savedSubscription);
    }
}
