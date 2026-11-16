import { Inject, Injectable } from '@nestjs/common';
import { IScenePartnerSubscriptionFacade } from '../../../scene-partner/application/interfaces/scene-partner-subscription-facade.interface';
import { SubscriptionEntitlement } from '../../domain/enums/billing.enums';
import { IUserSubscriptionRepository, USER_SUBSCRIPTION_REPOSITORY } from '../../domain/interfaces/user-subscription-repository.interface';
import { UserSubscriptionResponseDto } from '../dtos/user-subscription-response.dto';
import { IBillingSubscriptionFacade } from '../interfaces/billing-facades.interface';
import { SubscriptionDtoMapper } from '../mappers/subscription-dto.mapper';

@Injectable()
export class BillingSubscriptionFacade implements IBillingSubscriptionFacade, IScenePartnerSubscriptionFacade {
    constructor(
        @Inject(USER_SUBSCRIPTION_REPOSITORY) private readonly _userSubscriptionRepository: IUserSubscriptionRepository,
    ) { }

    async hasActiveSubscription(userId: string): Promise<boolean> {
        if (!userId || userId.trim().length === 0) {
            return false;
        }

        const subscription = await this._userSubscriptionRepository.findByUserId(userId.trim());
        if (!subscription) {
            return false;
        }

        return subscription.isActive();
    }

    async getEntitlements(userId: string): Promise<SubscriptionEntitlement[]> {
        if (!userId || userId.trim().length === 0) {
            return [];
        }

        const subscription = await this._userSubscriptionRepository.findByUserId(userId.trim());
        if (!subscription || !subscription.isActive()) {
            return [];
        }

        return subscription.entitlements;
    }

    async hasEntitlement(userId: string, entitlement: SubscriptionEntitlement): Promise<boolean> {
        if (!userId || userId.trim().length === 0 || !entitlement) {
            return false;
        }

        const subscription = await this._userSubscriptionRepository.findByUserId(userId.trim());
        if (!subscription) {
            return false;
        }

        return subscription.isEntitledTo(entitlement);
    }

    async canStartSession(userId: string): Promise<boolean> {
        return this.hasEntitlement(userId, SubscriptionEntitlement.SCENE_PARTNER_ACCESS);
    }

    async getActiveSubscriptionDetails(userId: string): Promise<UserSubscriptionResponseDto | null> {
        if (!userId || userId.trim().length === 0) {
            return null;
        }

        const subscription = await this._userSubscriptionRepository.findByUserId(userId.trim());
        if (!subscription || !subscription.isActive()) {
            return null;
        }

        return SubscriptionDtoMapper.toResponseDto(subscription);
    }
}
