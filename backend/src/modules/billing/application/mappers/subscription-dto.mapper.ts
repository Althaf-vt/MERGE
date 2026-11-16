import { UserSubscription } from '../../domain/entities/user-subscription.entity';
import { UserSubscriptionResponseDto } from '../dtos/user-subscription-response.dto';

export class SubscriptionDtoMapper {
    public static toResponseDto(entity: UserSubscription, atDate: Date = new Date()): UserSubscriptionResponseDto {
        return {
            id: entity.id,
            userId: entity.userId,
            planId: entity.planId,
            status: entity.status,
            currentPeriodStart: entity.currentPeriodStart,
            currentPeriodEnd: entity.currentPeriodEnd,
            autoRenew: entity.autoRenew,
            canceledAt: entity.canceledAt,
            cancelReason: entity.cancelReason,
            paymentMethodRef: entity.paymentMethodRef,
            entitlements: entity.entitlements,
            isActive: entity.isActive(atDate),
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        };
    }

    public static toDtoList(entities: UserSubscription[], atDate: Date = new Date()): UserSubscriptionResponseDto[] {
        return entities.map((entity) => SubscriptionDtoMapper.toResponseDto(entity, atDate));
    }
}
