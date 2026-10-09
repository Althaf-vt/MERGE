export const PhotoTaskStatus = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
} as const;

export type PhotoTaskStatus = typeof PhotoTaskStatus[keyof typeof PhotoTaskStatus];
