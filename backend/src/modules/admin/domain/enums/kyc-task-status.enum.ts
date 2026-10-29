export const KycTaskStatus = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    RESUBMISSION_REQUESTED: 'RESUBMISSION_REQUESTED',
} as const;

export type KycTaskStatus = typeof KycTaskStatus[keyof typeof KycTaskStatus];