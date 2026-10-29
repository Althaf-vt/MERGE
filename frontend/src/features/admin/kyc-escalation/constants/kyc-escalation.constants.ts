import type { KycResubmissionReason, KycTaskStatus, ClaimStatus } from "../types/kyc-escalation.types";

export interface KycResubmissionOption {
    value: KycResubmissionReason;
    label: string;
}

export const KYC_TASK_STATUS: Record<KycTaskStatus, KycTaskStatus> = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    RESUBMISSION_REQUESTED: 'RESUBMISSION_REQUESTED',
} as const;

export const KYC_CLAIM_STATUS: Record<ClaimStatus, ClaimStatus> = {
    UNCLAIMED: 'UNCLAIMED',
    CLAIMED: 'CLAIMED',
    RESOLVED: 'RESOLVED',
} as const;

export const DEFAULT_KYC_STATUS_FILTER = KYC_TASK_STATUS.PENDING;

export const KYC_STATUS_OPTIONS: { value: KycTaskStatus | ''; label: string }[] = [
    { value: '', label: 'ALL STATUSES' },
    { value: KYC_TASK_STATUS.PENDING, label: 'PENDING REVIEW' },
    { value: KYC_TASK_STATUS.RESUBMISSION_REQUESTED, label: 'RESUBMISSION REQUESTED' },
    { value: KYC_TASK_STATUS.APPROVED, label: 'APPROVED' },
    { value: KYC_TASK_STATUS.REJECTED, label: 'REJECTED' },
];

export const KYC_CLAIM_OPTIONS: { value: ClaimStatus | ''; label: string }[] = [
    { value: '', label: 'ALL CLAIMS' },
    { value: KYC_CLAIM_STATUS.UNCLAIMED, label: 'UNCLAIMED' },
    { value: KYC_CLAIM_STATUS.CLAIMED, label: 'CLAIMED' },
    { value: KYC_CLAIM_STATUS.RESOLVED, label: 'RESOLVED' },
];

export const KYC_RESUBMISSION_OPTIONS: KycResubmissionOption[] = [
    { value: 'RETAKE_SELFIE', label: 'Retake Selfie' },
    { value: 'UPLOAD_CORRECT_DOCUMENT', label: 'Upload Correct Document' },
    { value: 'COUNTRY_SELECTION_CORRECTION', label: 'Country Selection Correction' },
    { value: 'RETRY_LIVENESS_VERIFICATION', label: 'Retry Liveness Verification' },
    { value: 'OTHER', label: 'Other' },
];
