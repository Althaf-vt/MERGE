import { IBaseRepository } from '../../../../shared/domain/interfaces/base-repository.interface';
import { BillingPeriod } from '../enums/billing.enums';
import { SubscriptionPlan } from '../entities/subscription-plan.entity';

export const SUBSCRIPTION_PLAN_REPOSITORY = 'SUBSCRIPTION_PLAN_REPOSITORY';

export interface ISubscriptionPlanRepository extends IBaseRepository<SubscriptionPlan> {
    findByCode(code: string): Promise<SubscriptionPlan | null>;
    findByNormalizedName(normalizedName: string, billingPeriod: BillingPeriod): Promise<SubscriptionPlan | null>;
    findActive(): Promise<SubscriptionPlan[]>;
    findAll(): Promise<SubscriptionPlan[]>;
    count(): Promise<number>;
}
