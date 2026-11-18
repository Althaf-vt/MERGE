import { DomainEvent } from "../../../../shared/domain/events/domain-events.interface";
import { USER_DOMAIN_EVENTS } from "../constants/user-events.constant";

export class UserBannedDomainEvent implements DomainEvent {
    public readonly occuredOn: Date = new Date();
    public readonly eventName: string = USER_DOMAIN_EVENTS.BANNED;

    constructor(
        public readonly userId: string,
        public readonly reason: string,
    ) { }
}
