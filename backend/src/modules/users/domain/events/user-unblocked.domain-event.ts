import { DomainEvent } from "../../../../shared/domain/events/domain-events.interface";

export class UserUnblockDomainEvent implements DomainEvent{
    public readonly occuredOn: Date = new Date();
    public eventName: string = 'user.unblocked';

    constructor(
        public readonly blockerId: string,
        public readonly blockedId: string,
    ){ }
}