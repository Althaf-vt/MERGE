import { PlanOfferResponseDto, PlanPriceResponseDto } from './subscription-plan-response.dto';

export interface CreditPackResponseDto {
    id: string;
    name: string;
    code: string;
    creditsCount: number;
    price: PlanPriceResponseDto;
    effectivePrice: PlanPriceResponseDto;
    offers: PlanOfferResponseDto[];
    badge: string | null;
    sortOrder: number;
    isListed: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface PaginatedCreditPacksResponseDto {
    items: CreditPackResponseDto[];
    total: number;
}
