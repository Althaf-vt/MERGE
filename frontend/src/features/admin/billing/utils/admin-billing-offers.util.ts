export type OfferStatus = 'ACTIVE' | 'SCHEDULED' | 'EXPIRED' | 'DISABLED';

export interface OfferTemporalCheckable {
    validFrom: string | Date;
    validUntil: string | Date;
    isActive: boolean;
}


//  Evaluates the temporal state of a promotional offer relative to a given point in time.
//  - DISABLED: The administrative isActive toggle is false.
//  - SCHEDULED: The offer has not yet started (now < validFrom).
//  - EXPIRED: The offer validity window has elapsed (now > validUntil).
//  - ACTIVE: The offer is currently active and within its date window.

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

export interface OffersSummary {
    activeCount: number;
    scheduledCount: number;
    expiredCount: number;
    disabledCount: number;
    totalCount: number;
}


//  Aggregates count summaries across an array of promotional offers.

export const getOffersSummary = (
    offers?: OfferTemporalCheckable[],
    now: Date = new Date(),
): OffersSummary => {
    if (!offers || offers.length === 0) {
        return {
            activeCount: 0,
            scheduledCount: 0,
            expiredCount: 0,
            disabledCount: 0,
            totalCount: 0,
        };
    }

    let activeCount = 0;
    let scheduledCount = 0;
    let expiredCount = 0;
    let disabledCount = 0;

    for (const offer of offers) {
        const status = getOfferStatus(offer, now);
        if (status === 'ACTIVE') activeCount++;
        else if (status === 'SCHEDULED') scheduledCount++;
        else if (status === 'EXPIRED') expiredCount++;
        else if (status === 'DISABLED') disabledCount++;
    }

    return {
        activeCount,
        scheduledCount,
        expiredCount,
        disabledCount,
        totalCount: offers.length,
    };
};
