import { Inject, Injectable } from '@nestjs/common';
import { BILLING_ID_PREFIXES, generateBillingId, SUBSCRIPTION_RENEWAL_MESSAGES } from '../../domain/constants/billing.constants';
import { BillingTransaction } from '../../domain/entities/billing-transaction.entity';
import { UserSubscription } from '../../domain/entities/user-subscription.entity';
import { AutoRenewalAction, PaymentEnvironment, SubscriptionStatus } from '../../domain/enums/billing.enums';
import { BILLING_TRANSACTION_REPOSITORY, IBillingTransactionRepository } from '../../domain/interfaces/billing-transaction-repository.interface';
import { ISubscriptionPlanRepository, SUBSCRIPTION_PLAN_REPOSITORY } from '../../domain/interfaces/subscription-plan-repository.interface';
import { IUserSubscriptionRepository, USER_SUBSCRIPTION_REPOSITORY } from '../../domain/interfaces/user-subscription-repository.interface';
import { PlanBillingPeriod } from '../../domain/value-objects/plan-billing-period.vo';
import { IProcessSubscriptionRenewalsUseCase, SubscriptionRenewalBatchResult, SubscriptionRenewalItemResult } from '../interfaces/subscription-lifecycle.use-cases.interface';

@Injectable()
export class ProcessSubscriptionRenewalsUseCase implements IProcessSubscriptionRenewalsUseCase {
    constructor(
        @Inject(USER_SUBSCRIPTION_REPOSITORY) private readonly _userSubscriptionRepository: IUserSubscriptionRepository,
        @Inject(SUBSCRIPTION_PLAN_REPOSITORY) private readonly _subscriptionPlanRepository: ISubscriptionPlanRepository,
        @Inject(BILLING_TRANSACTION_REPOSITORY) private readonly _billingTransactionRepository: IBillingTransactionRepository,
    ) { }

    async execute(targetUserId?: string): Promise<SubscriptionRenewalBatchResult> {
        const now = new Date();
        const subscriptionsToProcess = await this._resolveSubscriptions(targetUserId, now);

        const details: SubscriptionRenewalItemResult[] = [];
        let renewedCount = 0;
        let expiredCount = 0;
        let failedCount = 0;

        for (const subscription of subscriptionsToProcess) {
            const result = await this._processSingleSubscription(subscription, now);
            details.push(result);

            switch (result.action) {
                case AutoRenewalAction.RENEWED:
                    renewedCount++;
                    break;
                case AutoRenewalAction.EXPIRED:
                    expiredCount++;
                    break;
                case AutoRenewalAction.FAILED:
                    failedCount++;
                    break;
                case AutoRenewalAction.SKIPPED:
                    break;
            }
        }

        return {
            processedCount: subscriptionsToProcess.length,
            renewedCount,
            expiredCount,
            failedCount,
            details,
        };
    }

    private async _resolveSubscriptions(targetUserId: string | undefined, now: Date): Promise<UserSubscription[]> {
        if (targetUserId && targetUserId.trim().length > 0) {
            const userSub = await this._userSubscriptionRepository.findByUserId(targetUserId.trim());
            return userSub ? [userSub] : [];
        }
        return this._userSubscriptionRepository.findSubscriptionsDueForRenewal(now);
    }

    private async _processSingleSubscription(
        subscription: UserSubscription,
        now: Date,
    ): Promise<SubscriptionRenewalItemResult> {
        if (
            subscription.status === SubscriptionStatus.EXPIRED ||
            subscription.status === SubscriptionStatus.INACTIVE
        ) {
            return {
                subscriptionId: subscription.id,
                userId: subscription.userId,
                action: AutoRenewalAction.SKIPPED,
                reason: SUBSCRIPTION_RENEWAL_MESSAGES.ALREADY_INACTIVE,
            };
        }

        if (subscription.currentPeriodEnd > now) {
            return {
                subscriptionId: subscription.id,
                userId: subscription.userId,
                action: AutoRenewalAction.SKIPPED,
                reason: SUBSCRIPTION_RENEWAL_MESSAGES.NOT_DUE_YET,
            };
        }

        if (!subscription.autoRenew) {
            subscription.expire();
            await this._userSubscriptionRepository.update(subscription);
            return {
                subscriptionId: subscription.id,
                userId: subscription.userId,
                action: AutoRenewalAction.EXPIRED,
                reason: SUBSCRIPTION_RENEWAL_MESSAGES.AUTO_RENEW_DISABLED,
            };
        }

        try {
            const plan = await this._subscriptionPlanRepository.findById(subscription.planId);
            if (!plan || !plan.isActive) {
                subscription.markPastDue();
                await this._userSubscriptionRepository.update(subscription);
                return {
                    subscriptionId: subscription.id,
                    userId: subscription.userId,
                    action: AutoRenewalAction.FAILED,
                    reason: SUBSCRIPTION_RENEWAL_MESSAGES.PLAN_UNAVAILABLE,
                };
            }

            const newEnd = PlanBillingPeriod.create(plan.billingPeriod).calculatePeriodEnd(
                subscription.currentPeriodEnd,
            );

            subscription.renewPeriod({
                newPeriodEnd: newEnd,
                paymentMethodRef: subscription.paymentMethodRef ?? undefined,
            });

            const effectivePrice = plan.calculateEffectivePrice(now);
            const renewalTx = BillingTransaction.createSubscriptionRenewal({
                id: generateBillingId(BILLING_ID_PREFIXES.TRANSACTION),
                userId: subscription.userId,
                planId: plan.id,
                planName: plan.name,
                price: effectivePrice,
                gatewayPaymentId: subscription.paymentMethodRef ?? null,
                environment: PaymentEnvironment.TEST,
            });

            await Promise.all([
                this._userSubscriptionRepository.update(subscription),
                this._billingTransactionRepository.create(renewalTx),
            ]);

            return {
                subscriptionId: subscription.id,
                userId: subscription.userId,
                action: AutoRenewalAction.RENEWED,
            };
        } catch (error) {
            return {
                subscriptionId: subscription.id,
                userId: subscription.userId,
                action: AutoRenewalAction.FAILED,
                reason: error instanceof Error ? error.message : SUBSCRIPTION_RENEWAL_MESSAGES.UNKNOWN_ERROR,
            };
        }
    }
}
