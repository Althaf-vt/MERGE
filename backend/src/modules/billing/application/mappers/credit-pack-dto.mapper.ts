import { BILLING_ID_PREFIXES, generateBillingId } from '../../domain/constants/billing.constants';
import { CreditPack } from '../../domain/entities/credit-pack.entity';
import { CreateCreditPackProps, CreditPackSnapshot, UpdateCreditPackProps } from '../../domain/interfaces/credit-pack.types';
import { MoneyVO } from '../../domain/value-objects/money.vo';
import { CreditPackResponseDto, PaginatedCreditPacksResponseDto } from '../dtos/credit-pack-response.dto';
import { CreateCreditPackDto, UpdateCreditPackDto } from '../dtos/manage-credit-pack.dto';
import { PlanPriceResponseDto } from '../dtos/subscription-plan-response.dto';
import { SubscriptionPlanDtoMapper } from './subscription-plan-dto.mapper';

export class CreditPackDtoMapper {
    public static toPlanPriceResponseDto(price: MoneyVO): PlanPriceResponseDto {
        return {
            amount: price.amount,
            currency: price.currency,
            formatted: price.format(),
        };
    }

    public static toResponseDto(entity: CreditPack, atDate: Date = new Date()): CreditPackResponseDto {
        const effectivePrice = entity.calculateEffectivePrice(atDate);

        return {
            id: entity.id,
            name: entity.name,
            code: entity.code,
            creditsCount: entity.creditsCount,
            price: CreditPackDtoMapper.toPlanPriceResponseDto(entity.price),
            effectivePrice: CreditPackDtoMapper.toPlanPriceResponseDto(effectivePrice),
            offers: entity.offers.map((offer) => SubscriptionPlanDtoMapper.toPlanOfferResponseDto(offer)),
            badge: entity.badge,
            sortOrder: entity.sortOrder,
            isListed: entity.isListed,
            isActive: entity.isActive,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        };
    }

    public static toDtoList(entities: CreditPack[], atDate: Date = new Date()): CreditPackResponseDto[] {
        return entities.map((entity) => CreditPackDtoMapper.toResponseDto(entity, atDate));
    }

    public static toPaginatedResponseDto(
        entities: CreditPack[],
        total: number,
        atDate: Date = new Date(),
    ): PaginatedCreditPacksResponseDto {
        return {
            items: CreditPackDtoMapper.toDtoList(entities, atDate),
            total,
        };
    }

    public static toCreateProps(dto: CreateCreditPackDto): CreateCreditPackProps {
        return {
            id: generateBillingId(BILLING_ID_PREFIXES.CREDIT_PACK),
            name: dto.name,
            code: dto.code,
            creditsCount: dto.creditsCount,
            price: {
                amount: dto.price.amount,
                currency: dto.price.currency,
            },
            offers: dto.offers ? SubscriptionPlanDtoMapper.toOfferPropsList(dto.offers) : undefined,
            badge: dto.badge?.trim() ?? null,
            sortOrder: dto.sortOrder,
            isListed: dto.isListed,
            isActive: dto.isActive,
        };
    }

    public static toUpdateProps(
        dto: UpdateCreditPackDto,
        current: CreditPackSnapshot,
    ): UpdateCreditPackProps {
        return {
            name: dto.name?.trim() ?? current.name,
            creditsCount: dto.creditsCount !== undefined ? dto.creditsCount : current.creditsCount,
            price: dto.price
                ? { amount: dto.price.amount, currency: dto.price.currency }
                : current.price,
            offers: dto.offers
                ? SubscriptionPlanDtoMapper.toOfferPropsList(dto.offers)
                : current.offers,
            badge: dto.badge !== undefined ? (dto.badge?.trim() ?? null) : current.badge,
            sortOrder: dto.sortOrder !== undefined ? dto.sortOrder : current.sortOrder,
        };
    }
}
