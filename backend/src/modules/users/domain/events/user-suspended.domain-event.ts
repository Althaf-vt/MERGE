import { DomainEvent } from "../../../../shared/domain/events/domain-events.interface";
import { USER_DOMAIN_EVENTS } from "../constants/user-events.constant";

export class UserSuspendedDomainEvent implements DomainEvent {
    public readonly occuredOn: Date = new Date();
    public readonly eventName: string = USER_DOMAIN_EVENTS.SUSPENDED;

    constructor(
        public readonly userId: string,
        public readonly reason: string,
        public readonly suspendedUntil: Date,
    ) { }
}
