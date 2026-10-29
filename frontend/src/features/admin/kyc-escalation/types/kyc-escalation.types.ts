export type KycTaskStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type ClaimStatus = 'UNCLAIMED' | 'CLAIMED' | 'RESOLVED';

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