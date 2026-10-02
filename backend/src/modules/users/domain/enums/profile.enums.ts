// backend/src/modules/users/domain/enums/profile.enums.ts

export const InfectiousVisibility = {
    MATCH_ONLY: 'MATCH_ONLY',
    EVERYONE: 'EVERYONE',
    HIDDEN: 'HIDDEN'
} as const;
export type InfectiousVisibility = typeof InfectiousVisibility[keyof typeof InfectiousVisibility];

export const PhotoVerificationStatus = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED'
} as const;
export type PhotoVerificationStatus = typeof PhotoVerificationStatus[keyof typeof PhotoVerificationStatus];

export const ProfileVisibility = {
    VISIBLE: 'VISIBLE',
    PAUSED: 'PAUSED',
    HIDDEN: 'HIDDEN'
} as const;
export type ProfileVisibility = typeof ProfileVisibility[keyof typeof ProfileVisibility];