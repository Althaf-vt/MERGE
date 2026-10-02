import { DomainEvent } from "../../../../shared/domain/events/domain-events.interface";
import { BlockReason } from "../enums/user.enums";

export class UserBlockedDomainEvent implements DomainEvent {
    public readonly occuredOn: Date = new Date();
    public readonly eventName: string = 'user.blocked';

    constructor(
        public readonly blockerId: string,
        public readonly blockedId: string,
        public readonly reason: BlockReason
    ) { }
}