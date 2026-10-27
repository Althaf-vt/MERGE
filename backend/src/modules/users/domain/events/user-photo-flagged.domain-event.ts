import { IUserPhotoFlaggedEventPayload, PHOTO_MODERATION_EVENTS } from "../../../../shared/domain/events/photo-moderation-events.contract";

export class UserPhotoFlaggedDomainEvent implements IUserPhotoFlaggedEventPayload {
    public readonly occuredOn: Date = new Date();
    public readonly eventName: string = PHOTO_MODERATION_EVENTS.USER_PHOTO_FLAGGED;

    constructor(
        public readonly userId: string,
        public readonly photoId: string,
        public readonly kycSelfieUrl: string,
        public readonly uploadedPhotoUrl: string,
        public readonly faceMatchScore: number
    ) { }
}