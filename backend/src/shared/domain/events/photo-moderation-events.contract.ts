import { DomainEvent } from "./domain-events.interface";

// Centralized cross-module event names
export const PHOTO_MODERATION_EVENTS = {
    USER_PHOTO_FLAGGED: 'user.photo.flagged',
    ADMIN_PHOTO_APPROVED: 'admin.photo.approved',
    ADMIN_PHOTO_REJECTED: 'admin.photo.rejected',
} as const;

// Shared contract emitted by Users module and consumed by Admin module
export interface IUserPhotoFlaggedEventPayload extends DomainEvent {
    readonly userId: string;
    readonly photoId: string;
    readonly kycSelfieUrl: string;
    readonly uploadedPhotoUrl: string;
    readonly faceMatchScore: number;
}

// Shared contract emitted by Admin module and consumed by Users module
export interface IPhotoApprovedEventPayload extends DomainEvent {
    readonly targetUserId: string;
    readonly photoId: string;
}

// Shared contract emitted by Admin module and consumed by Users module
export interface IPhotoRejectedEventPayload extends DomainEvent {
    readonly targetUserId: string;
    readonly photoId: string;
    readonly reason: string;
}