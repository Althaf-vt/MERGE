import { DomainEvent } from "../../../../shared/domain/events/domain-events.interface";

export class UserBannedDomainEvent implements DomainEvent {
    public readonly occuredOn: Date = new Date();
    public readonly eventName: 'user.banned';

    constructor(
        public readonly userId: string,
        public readonly reason: string
    ) { }
}