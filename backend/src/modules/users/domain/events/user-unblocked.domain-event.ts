import { DomainEvent } from "../../../../shared/domain/events/domain-events.interface";
import { USER_DOMAIN_EVENTS } from "../constants/user-events.constant";

export class UserUnblockedDomainEvent implements DomainEvent {
    public readonly occuredOn: Date = new Date();
    public readonly eventName: string = USER_DOMAIN_EVENTS.UNBLOCKED;

    constructor(
        public readonly blockerId: string,
        public readonly blockedId: string,
    ) { }
}
