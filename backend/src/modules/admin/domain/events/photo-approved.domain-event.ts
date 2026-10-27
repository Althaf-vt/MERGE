import { IPhotoApprovedEventPayload, PHOTO_MODERATION_EVENTS } from "../../../../shared/domain/events/photo-moderation-events.contract";

export class PhotoApprovedDomainEvent implements IPhotoApprovedEventPayload {
    public readonly occuredOn: Date = new Date();
    public readonly eventName: string = PHOTO_MODERATION_EVENTS.ADMIN_PHOTO_APPROVED;

    constructor(
        public readonly targetUserId: string,
        public readonly photoId: string,
    ) { }
}