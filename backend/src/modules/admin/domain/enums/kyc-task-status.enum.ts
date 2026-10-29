export const KycTaskStatus = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
} as const;

export type KycTaskStatus = typeof KycTaskStatus[keyof typeof KycTaskStatus];