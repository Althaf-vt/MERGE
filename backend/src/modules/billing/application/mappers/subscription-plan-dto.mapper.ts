import { SubscriptionPlan } from '../../domain/entities/subscription-plan.entity';
import { MoneyVO } from '../../domain/value-objects/money.vo';
import { PlanOffer } from '../../domain/value-objects/plan-offer.vo';
import { PaginatedSubscriptionPlansResponseDto, PlanOfferResponseDto, PlanPriceResponseDto, SubscriptionPlanResponseDto } from '../dtos/subscription-plan-response.dto';

export class SubscriptionPlanDtoMapper {
    public static toPlanPriceResponseDto(price: MoneyVO): PlanPriceResponseDto {
        return {
            amount: price.amount,
            currency: price.currency,
            formatted: price.format(),
        };
    }

    public static toPlanOfferResponseDto(offer: PlanOffer): PlanOfferResponseDto {
        return {
            code: offer.code,
            discountPercentage: offer.discountPercentage,
            validFrom: offer.validFrom,
            validUntil: offer.validUntil,
            isActive: offer.isActive,
        };
    }

    public static toResponseDto(entity: SubscriptionPlan, atDate: Date = new Date()): SubscriptionPlanResponseDto {
        const effectivePrice = entity.calculateEffectivePrice(atDate);

        return {
            id: entity.id,
            name: entity.name,
            code: entity.code,
            billingPeriod: entity.billingPeriod,
            price: SubscriptionPlanDtoMapper.toPlanPriceResponseDto(entity.price),
            effectivePrice: SubscriptionPlanDtoMapper.toPlanPriceResponseDto(effectivePrice),
            entitlements: entity.entitlements,
            offers: entity.offers.map((offer) => SubscriptionPlanDtoMapper.toPlanOfferResponseDto(offer)),
            sortOrder: entity.sortOrder,
            isActive: entity.isActive,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        };
    }

    public static toDtoList(entities: SubscriptionPlan[], atDate: Date = new Date()): SubscriptionPlanResponseDto[] {
        return entities.map((entity) => SubscriptionPlanDtoMapper.toResponseDto(entity, atDate));
    }

    public static toPaginatedResponseDto(
        entities: SubscriptionPlan[],
        total: number,
        atDate: Date = new Date(),
    ): PaginatedSubscriptionPlansResponseDto {
        return {
            items: SubscriptionPlanDtoMapper.toDtoList(entities, atDate),
            total,
        };
    }
}
