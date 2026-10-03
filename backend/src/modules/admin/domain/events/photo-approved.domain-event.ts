import { DomainEvent } from "../../../../shared/domain/events/domain-events.interface";

export class PhotoApprovedDomainEvent implements DomainEvent {
    public readonly occuredOn: Date = new Date();
    public readonly eventName: string = 'admin.photo.approved';

    constructor(
        public readonly targetUserId: string,
        public readonly photoId: string,
    ) { }
}