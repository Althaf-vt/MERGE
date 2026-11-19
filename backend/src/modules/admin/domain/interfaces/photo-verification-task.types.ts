import { ClaimDetailsVO } from "../value-objects/claim-details.vo";
import { ClaimDetailsSnapshot } from "./claim-details.types";
import { PhotoTaskStatus } from "../enums/photo-task-status.enum";

export interface PhotoVerificationTaskProps {
    id?: string;
    targetUserId: string;
    photoId: string;
    kycSelfieUrl: string; // The Golden Identity baseline
    uploadedPhotoUrl: string; // The low-confidence photo under review
    faceMatchScore: number;
    taskStatus?: PhotoTaskStatus;
    claimDetails?: ClaimDetailsVO;
    rejectionReason?: string;
    resolvedAt?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface PhotoVerificationTaskSnapshot {
    id: string;
    targetUserId: string;
    photoId: string;
    kycSelfieUrl: string;
    uploadedPhotoUrl: string;
    faceMatchScore: number;
    taskStatus: PhotoTaskStatus;
    claimDetails: ClaimDetailsSnapshot;
    rejectionReason?: string;
    resolvedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface RejectPhotoVerificationPayload {
    adminId: string;
    isSuperAdmin: boolean;
    reason: string;
}
