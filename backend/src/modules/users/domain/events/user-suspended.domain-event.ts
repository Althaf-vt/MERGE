import { DomainEvent } from "../../../../shared/domain/events/domain-events.interface";

export class UserSupendedDomainEvent implements DomainEvent {
    public readonly occuredOn: Date = new Date();
    public readonly eventName: 'user.suspended';

    constructor(
        public readonly userId: string,
        public readonly reason: string,
        public readonly suspendedUntil: Date
    ) { }
}