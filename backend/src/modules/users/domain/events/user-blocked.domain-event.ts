import { DomainEvent } from "../../../../shared/domain/events/domain-events.interface";
import { BlockReason } from "../enums/user.enums";
import { USER_DOMAIN_EVENTS } from "../constants/user-events.constant";

export class UserBlockedDomainEvent implements DomainEvent {
    public readonly occuredOn: Date = new Date();
    public readonly eventName: string = USER_DOMAIN_EVENTS.BLOCKED;

    constructor(
        public readonly blockerId: string,
        public readonly blockedId: string,
        public readonly reason: BlockReason,
    ) { }
}
