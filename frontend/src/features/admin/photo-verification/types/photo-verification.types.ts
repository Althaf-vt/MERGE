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
}

export interface GetPhotoTasksParams {
    page?: number;
    limit?: number;
    status?: PhotoTaskStatus;
    claimStatus?: ClaimStatus;
    claimedBy?: string;
}

export interface PaginatedPhotoTasksResponse {
    success: boolean;
    data: PhotoVerificationTask[];
    meta: {
        total: number;
        page: number;
        limit: number;
    };
}

export interface RejectPhotoTaskPayload {
    taskId: string;
    reason: string;
}