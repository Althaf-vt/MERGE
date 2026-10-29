import type { KycResubmissionReason } from "../types/kyc-escalation.types";

export interface KycResubmissionOption {
    value: KycResubmissionReason;
    label: string;
}

export const KYC_RESUBMISSION_OPTIONS: KycResubmissionOption[] = [
    { value: 'RETAKE_SELFIE', label: 'Retake Selfie' },
    { value: 'UPLOAD_CORRECT_DOCUMENT', label: 'Upload Correct Document' },
    { value: 'COUNTRY_SELECTION_CORRECTION', label: 'Country Selection Correction' },
    { value: 'RETRY_LIVENESS_VERIFICATION', label: 'Retry Liveness Verification' },
    { value: 'OTHER', label: 'Other' },
];