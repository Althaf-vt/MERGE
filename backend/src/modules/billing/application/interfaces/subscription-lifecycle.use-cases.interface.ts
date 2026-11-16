import { AutoRenewalAction } from '../../domain/enums/billing.enums';
import { CancelSubscriptionDto } from '../dtos/cancel-subscription.dto';
import { SubscribePlanDto } from '../dtos/subscribe-plan.dto';
import { ToggleAutoRenewDto } from '../dtos/toggle-auto-renew.dto';
import { UserSubscriptionResponseDto } from '../dtos/user-subscription-response.dto';

export const GET_USER_SUBSCRIPTION_USE_CASE = 'GET_USER_SUBSCRIPTION_USE_CASE';
export const SUBSCRIBE_USER_USE_CASE = 'SUBSCRIBE_USER_USE_CASE';
export const TOGGLE_AUTO_RENEWAL_USE_CASE = 'TOGGLE_AUTO_RENEWAL_USE_CASE';
export const CANCEL_SUBSCRIPTION_USE_CASE = 'CANCEL_SUBSCRIPTION_USE_CASE';
export const PROCESS_SUBSCRIPTION_RENEWALS_USE_CASE = 'PROCESS_SUBSCRIPTION_RENEWALS_USE_CASE';

export interface SubscriptionRenewalItemResult {
    subscriptionId: string;
    userId: string;
    action: AutoRenewalAction;
    reason?: string;
}

export interface SubscriptionRenewalBatchResult {
    processedCount: number;
    renewedCount: number;
    expiredCount: number;
    failedCount: number;
    details: SubscriptionRenewalItemResult[];
}

export interface IGetUserSubscriptionUseCase {
    execute(userId: string): Promise<UserSubscriptionResponseDto | null>;
}

export interface ISubscribeUserUseCase {
    execute(userId: string, dto: SubscribePlanDto): Promise<UserSubscriptionResponseDto>;
}

export interface IToggleAutoRenewalUseCase {
    execute(userId: string, dto: ToggleAutoRenewDto): Promise<UserSubscriptionResponseDto>;
}

export interface ICancelSubscriptionUseCase {
    execute(userId: string, dto?: CancelSubscriptionDto): Promise<UserSubscriptionResponseDto>;
}

export interface IProcessSubscriptionRenewalsUseCase {
    execute(targetUserId?: string): Promise<SubscriptionRenewalBatchResult>;
}
