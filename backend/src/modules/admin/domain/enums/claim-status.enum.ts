export const ClaimStatus = {
    UNCLAIMED: 'UNCLAIMED',
    CLAIMED: 'CLAIMED',
    RESOLVED: 'RESOLVED',
} as const;

export type ClaimStatus = typeof ClaimStatus[keyof typeof ClaimStatus];