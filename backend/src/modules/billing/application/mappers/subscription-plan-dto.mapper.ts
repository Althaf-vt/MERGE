import { SubscriptionPlan } from '../../domain/entities/subscription-plan.entity';
import { PlanOfferProps } from '../../domain/interfaces/billing-value-objects.types';
import { CreateSubscriptionPlanProps, SubscriptionPlanSnapshot, UpdateSubscriptionPlanProps } from '../../domain/interfaces/subscription-plan.types';
import { MoneyVO } from '../../domain/value-objects/money.vo';
import { PlanOffer } from '../../domain/value-objects/plan-offer.vo';
import { CreateSubscriptionPlanDto, PlanOfferInputDto, UpdateSubscriptionPlanDto } from '../dtos/manage-plan.dto';
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

    public static toOfferProps(dto: PlanOfferInputDto): PlanOfferProps {
        return {
            code: dto.code,
            discountPercentage: dto.discountPercentage,
            validFrom: dto.validFrom,
            validUntil: dto.validUntil,
            isActive: dto.isActive ?? true,
        };
    }

    public static toOfferPropsList(dtos?: PlanOfferInputDto[]): PlanOfferProps[] {
        if (!dtos || dtos.length === 0) {
            return [];
        }
        return dtos.map((dto) => SubscriptionPlanDtoMapper.toOfferProps(dto));
    }

    public static toCreateProps(dto: CreateSubscriptionPlanDto, id: string): CreateSubscriptionPlanProps {
        return {
            id,
            name: dto.name,
            code: dto.code,
            billingPeriod: dto.billingPeriod,
            price: {
                amount: dto.price.amount,
                currency: dto.price.currency,
            },
            entitlements: dto.entitlements,
            offers: dto.offers ? SubscriptionPlanDtoMapper.toOfferPropsList(dto.offers) : undefined,
            sortOrder: dto.sortOrder,
            isActive: dto.isActive,
        };
    }

    public static toUpdateProps(
        dto: UpdateSubscriptionPlanDto,
        current: SubscriptionPlanSnapshot,
    ): UpdateSubscriptionPlanProps {
        return {
            name: dto.name?.trim() ?? current.name,
            price: dto.price
                ? { amount: dto.price.amount, currency: dto.price.currency }
                : current.price,
            entitlements: dto.entitlements ?? current.entitlements,
            offers: dto.offers
                ? SubscriptionPlanDtoMapper.toOfferPropsList(dto.offers)
                : current.offers,
            sortOrder: dto.sortOrder !== undefined ? dto.sortOrder : current.sortOrder,
        };
    }
}
