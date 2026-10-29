export type KycTaskStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'RESUBMISSION_REQUESTED';
export type ClaimStatus = 'UNCLAIMED' | 'CLAIMED' | 'RESOLVED';

export type KycResubmissionReason = 
    | 'RETAKE_SELFIE'
    | 'UPLOAD_CORRECT_DOCUMENT'
    | 'COUNTRY_SELECTION_CORRECTION'
    | 'RETRY_LIVENESS_VERIFICATION'
    | 'OTHER';

export interface KycEscalationTask {
    id: string;
    targetUserId: string;
    documentType: string;
    issuingCountry: string;
    kycSelfieUrl: string;
    uploadedDocumentUrl: string;
    livenessScore: number;
    faceMatchScore: number;
    taskStatus: KycTaskStatus;
    claimStatus: ClaimStatus;
    claimedBy: string | null;
    rejectionReason?: string;
    resubmissionReasons?: KycResubmissionReason[];
    resubmissionMessage?: string | null;
    resolvedAt: string | null; 
    createdAt: string;
}

export interface GetKycTasksQuery {
    page?: number;
    limit?: number;
    status?: KycTaskStatus;
    claimStatus?: ClaimStatus;
    claimedBy?: string;
}

export interface RejectKycTaskPayload {
    id: string;
    reason: string;
}

export interface RequestKycResubmissionPayload {
    id: string;
    reasons: KycResubmissionReason[];
    message?: string;
}