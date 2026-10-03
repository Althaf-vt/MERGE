import { DomainEvent } from "../../../../shared/domain/events/domain-events.interface";

export class PhotoRejectedDomainEvent implements DomainEvent {
    public readonly occuredOn: Date = new Date();
    public readonly eventName: string = 'admin.photo.rejected';

    constructor(
        public readonly targetUserId: string,
        public readonly photoId: string,
        public readonly reason: string
    ) { }
}