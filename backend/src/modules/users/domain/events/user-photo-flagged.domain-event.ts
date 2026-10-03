import { DomainEvent } from "../../../../shared/domain/events/domain-events.interface";

export class UserPhotoFlaggedDomainEvent implements DomainEvent {
    public readonly occuredOn: Date = new Date();
    public readonly eventName: string = 'user.photo.flagged';

    constructor(
        public readonly userId: string,
        public readonly photoId: string,
        public readonly kycSelfieUrl: string,
        public readonly uploadedPhotoUrl: string,
        public readonly faceMatchScore: number
    ) { }
}