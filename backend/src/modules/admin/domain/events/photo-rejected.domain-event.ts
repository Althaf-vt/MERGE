import { IPhotoRejectedEventPayload, PHOTO_MODERATION_EVENTS } from "../../../../shared/domain/events/photo-moderation-events.contract";

export class PhotoRejectedDomainEvent implements IPhotoRejectedEventPayload {
    public readonly occuredOn: Date = new Date();
    public readonly eventName: string = PHOTO_MODERATION_EVENTS.ADMIN_PHOTO_REJECTED;

    constructor(
        public readonly targetUserId: string,
        public readonly photoId: string,
        public readonly reason: string
    ) { }
}