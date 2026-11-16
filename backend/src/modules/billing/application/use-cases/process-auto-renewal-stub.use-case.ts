import { Inject, Injectable } from '@nestjs/common';
import { BILLING_ID_PREFIXES, generateBillingId } from '../../domain/constants/billing.constants';
import { BillingTransaction } from '../../domain/entities/billing-transaction.entity';
import { UserSubscription } from '../../domain/entities/user-subscription.entity';
import { PaymentEnvironment } from '../../domain/enums/billing.enums';
import { BILLING_TRANSACTION_REPOSITORY, IBillingTransactionRepository } from '../../domain/interfaces/billing-transaction-repository.interface';
import { ISubscriptionPlanRepository, SUBSCRIPTION_PLAN_REPOSITORY } from '../../domain/interfaces/subscription-plan-repository.interface';
import { IUserSubscriptionRepository, USER_SUBSCRIPTION_REPOSITORY } from '../../domain/interfaces/user-subscription-repository.interface';
import { PlanBillingPeriod } from '../../domain/value-objects/plan-billing-period.vo';
import { AutoRenewalItemResult, AutoRenewalStubResult, IProcessAutoRenewalStubUseCase } from '../interfaces/subscription-lifecycle.use-cases.interface';

@Injectable()
export class ProcessAutoRenewalStubUseCase implements IProcessAutoRenewalStubUseCase {
    constructor(
        @Inject(USER_SUBSCRIPTION_REPOSITORY) private readonly _userSubscriptionRepository: IUserSubscriptionRepository,
        @Inject(SUBSCRIPTION_PLAN_REPOSITORY) private readonly _subscriptionPlanRepository: ISubscriptionPlanRepository,
        @Inject(BILLING_TRANSACTION_REPOSITORY) private readonly _billingTransactionRepository: IBillingTransactionRepository,
    ) { }

    async execute(targetUserId?: string): Promise<AutoRenewalStubResult> {
        const now = new Date();
        const details: AutoRenewalItemResult[] = [];
        let renewedCount = 0;
        let expiredCount = 0;
        let failedCount = 0;

        let subscriptionsToProcess: UserSubscription[] = [];

        if (targetUserId && targetUserId.trim().length > 0) {
            const userSub = await this._userSubscriptionRepository.findByUserId(targetUserId.trim());
            if (userSub) {
                subscriptionsToProcess = [userSub];
            }
        } else {
            subscriptionsToProcess = await this._userSubscriptionRepository.findSubscriptionsDueForRenewal(now);
        }

        for (const subscription of subscriptionsToProcess) {
            try {
                if (subscription.autoRenew) {
                    const plan = await this._subscriptionPlanRepository.findById(subscription.planId);
                    if (!plan || !plan.isActive) {
                        subscription.markPastDue();
                        await this._userSubscriptionRepository.update(subscription);
                        failedCount++;
                        details.push({
                            subscriptionId: subscription.id,
                            userId: subscription.userId,
                            action: 'FAILED',
                            reason: 'Plan is inactive or does not exist.',
                        });
                        continue;
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

                    renewedCount++;
                    details.push({
                        subscriptionId: subscription.id,
                        userId: subscription.userId,
                        action: 'RENEWED',
                    });
                } else {
                    subscription.expire();
                    await this._userSubscriptionRepository.update(subscription);
                    expiredCount++;
                    details.push({
                        subscriptionId: subscription.id,
                        userId: subscription.userId,
                        action: 'EXPIRED',
                        reason: 'Auto-renewal is disabled; period expired.',
                    });
                }
            } catch (error) {
                failedCount++;
                details.push({
                    subscriptionId: subscription.id,
                    userId: subscription.userId,
                    action: 'FAILED',
                    reason: error instanceof Error ? error.message : 'Unknown renewal error.',
                });
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
}
