import { SubscriptionEntitlement } from '../../domain/enums/billing.enums';
import { AdminBillingHistoryQueryDto, PaginatedBillingHistoryResponseDto } from '../dtos/billing-transaction-response.dto';
import { CreditPackResponseDto } from '../dtos/credit-pack-response.dto';
import { CreateCreditPackDto, UpdateCreditPackDto } from '../dtos/manage-credit-pack.dto';
import { CreateSubscriptionPlanDto, UpdateSubscriptionPlanDto } from '../dtos/manage-plan.dto';
import { SubscriptionPlanResponseDto } from '../dtos/subscription-plan-response.dto';
import { UserSubscriptionResponseDto } from '../dtos/user-subscription-response.dto';

export const BILLING_SUBSCRIPTION_FACADE = 'BILLING_SUBSCRIPTION_FACADE';
export const BILLING_PRIORITY_CREDIT_FACADE = 'BILLING_PRIORITY_CREDIT_FACADE';
export const BILLING_ADMIN_FACADE = 'BILLING_ADMIN_FACADE';

export interface IBillingSubscriptionFacade {
    hasActiveSubscription(userId: string): Promise<boolean>;
    getEntitlements(userId: string): Promise<SubscriptionEntitlement[]>;
    hasEntitlement(userId: string, entitlement: SubscriptionEntitlement): Promise<boolean>;
    canStartSession(userId: string): Promise<boolean>;
    getActiveSubscriptionDetails(userId: string): Promise<UserSubscriptionResponseDto | null>;
}

export interface IBillingPriorityCreditFacade {
    deductPriorityCredit(userId: string, reason?: string, referenceId?: string): Promise<void>;
    hasEnoughCredits(userId: string, amount?: number): Promise<boolean>;
    getCreditBalance(userId: string): Promise<number>;
}

export interface IBillingAdminFacade {
    getAdminBillingHistory(query?: AdminBillingHistoryQueryDto): Promise<PaginatedBillingHistoryResponseDto>;
    getAllSubscriptionPlans(includeInactive?: boolean): Promise<SubscriptionPlanResponseDto[]>;
    createSubscriptionPlan(dto: CreateSubscriptionPlanDto): Promise<SubscriptionPlanResponseDto>;
    updateSubscriptionPlan(id: string, dto: UpdateSubscriptionPlanDto): Promise<SubscriptionPlanResponseDto>;
    getAllCreditPacks(includeUnlisted?: boolean): Promise<CreditPackResponseDto[]>;
    createCreditPack(dto: CreateCreditPackDto): Promise<CreditPackResponseDto>;
    updateCreditPack(id: string, dto: UpdateCreditPackDto): Promise<CreditPackResponseDto>;
}
