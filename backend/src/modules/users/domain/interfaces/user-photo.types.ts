import { PhotoVerificationStatus } from "../enums/profile.enums";

export interface UserPhotoProps {
    id: string;
    url: string;
    isPrimary: boolean;
    status: PhotoVerificationStatus;
    faceMatchScore?: number;
    rejectionReason?: string;
    uploadedAt?: Date;
}

export interface UserPhotoSnapshot {
    id: string;
    url: string;
    isPrimary: boolean;
    status: PhotoVerificationStatus;
    faceMatchScore?: number;
    rejectionReason?: string;
    uploadedAt?: Date;
    [key: string]: unknown;
}
