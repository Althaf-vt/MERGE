export const KycResubmissionReason = {
    RETAKE_SELFIE: 'RETAKE_SELFIE',
    UPLOAD_CORRECT_DOCUMENT: 'UPLOAD_CORRECT_DOCUMENT',
    COUNTRY_SELECTION_CORRECTION: 'COUNTRY_SELECTION_CORRECTION',
    RETRY_LIVENESS_VERIFICATION: 'RETRY_LIVENESS_VERIFICATION',
    OTHER: 'OTHER',
} as const;

export type KycResubmissionReason = typeof KycResubmissionReason[keyof typeof KycResubmissionReason];