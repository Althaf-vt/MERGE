import { Inject, Injectable } from '@nestjs/common';
import { SubscriptionEntitlement } from '../../domain/enums/billing.enums';
import { UserSubscriptionResponseDto } from '../dtos/user-subscription-response.dto';
import { IBillingSubscriptionFacade } from '../interfaces/billing-facades.interface';
import { GET_USER_SUBSCRIPTION_USE_CASE, IGetUserSubscriptionUseCase } from '../interfaces/subscription-lifecycle.use-cases.interface';

@Injectable()
export class BillingSubscriptionFacade implements IBillingSubscriptionFacade {
    constructor(
        @Inject(GET_USER_SUBSCRIPTION_USE_CASE) private readonly _getUserSubscriptionUseCase: IGetUserSubscriptionUseCase,
    ) { }

    async hasActiveSubscription(userId: string): Promise<boolean> {
        const subscription = await this._getActiveSubscription(userId);
        return subscription !== null;
    }

    async getEntitlements(userId: string): Promise<SubscriptionEntitlement[]> {
        const subscription = await this._getActiveSubscription(userId);
        return subscription?.entitlements ?? [];
    }

    async hasEntitlement(userId: string, entitlement: SubscriptionEntitlement): Promise<boolean> {
        if (!entitlement) return false;

        const subscription = await this._getActiveSubscription(userId);
        return subscription?.entitlements.includes(entitlement) ?? false;
    }

    async canStartSession(userId: string): Promise<boolean> {
        return this.hasEntitlement(userId, SubscriptionEntitlement.SCENE_PARTNER_ACCESS);
    }

    async getActiveSubscriptionDetails(userId: string): Promise<UserSubscriptionResponseDto | null> {
        return this._getActiveSubscription(userId);
    }

    private async _getActiveSubscription(userId: string): Promise<UserSubscriptionResponseDto | null> {
        if (!userId || userId.trim().length === 0) {
            return null;
        }

        const subscription = await this._getUserSubscriptionUseCase.execute(userId.trim());
        if (!subscription || !subscription.isActive) {
            return null;
        }

        return subscription;
    }
}
