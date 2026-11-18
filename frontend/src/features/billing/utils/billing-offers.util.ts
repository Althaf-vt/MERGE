import type { PlanOfferDto } from '../types/billing.types';

export type OfferStatus = 'ACTIVE' | 'SCHEDULED' | 'EXPIRED' | 'DISABLED';

export interface OfferTemporalCheckable {
    validFrom: string | Date;
    validUntil: string | Date;
    isActive: boolean;
}

// Evaluates the temporal state of an offer relative to a given point in time.
export const getOfferStatus = (
    offer: OfferTemporalCheckable,
    now: Date = new Date(),
): OfferStatus => {
    if (!offer.isActive) return 'DISABLED';
    const currentTime = now.getTime();
    const startTime = new Date(offer.validFrom).getTime();
    const endTime = new Date(offer.validUntil).getTime();

    if (currentTime < startTime) return 'SCHEDULED';
    if (currentTime > endTime) return 'EXPIRED';
    return 'ACTIVE';
};

// Returns the best currently active offer (highest discount percentage), or null if none are active.
export const getEffectiveOffer = (
    offers?: PlanOfferDto[],
    now: Date = new Date(),
): PlanOfferDto | null => {
    if (!offers || offers.length === 0) return null;
    const activeOffers = offers.filter((o) => getOfferStatus(o, now) === 'ACTIVE');
    if (activeOffers.length === 0) return null;

    return activeOffers.reduce((best, curr) =>
        curr.discountPercentage > best.discountPercentage ? curr : best,
    );
};
