export type PhotoTaskStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type ClaimStatus = 'UNCLAIMED' | 'CLAIMED' | 'RESOLVED';

export interface PhotoVerificationTask {
    id: string;
    targetUserId: string;
    photoId: string;
    kycSelfieUrl: string;
    uploadedPhotoUrl: string;
    faceMatchScore: number;
    taskStatus: PhotoTaskStatus;
    claimStatus: ClaimStatus;
    claimedBy: string | null;
    claimedAt: string | null;
    rejectionReason?: string;
    resolvedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface GetPhotoTasksQueryParams {
    page?: number;
    limit?: number;
    status?: PhotoTaskStatus;
    claimStatus?: ClaimStatus;
    claimedBy?: string;
}

export interface RejectPhotoTaskPayload {
    taskId: string;
    reason: string;
}