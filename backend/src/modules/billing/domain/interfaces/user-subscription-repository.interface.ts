import { IBaseRepository } from '../../../../shared/domain/interfaces/base-repository.interface';
import { UserSubscription } from '../entities/user-subscription.entity';

export const USER_SUBSCRIPTION_REPOSITORY = 'USER_SUBSCRIPTION_REPOSITORY';

export interface IUserSubscriptionRepository extends IBaseRepository<UserSubscription> {
    findByUserId(userId: string): Promise<UserSubscription | null>;
    findActiveByUserId(userId: string): Promise<UserSubscription | null>;
    findSubscriptionsDueForRenewal(cutoffDate: Date): Promise<UserSubscription[]>;
    findExpiredSubscriptions(now: Date): Promise<UserSubscription[]>;
}
