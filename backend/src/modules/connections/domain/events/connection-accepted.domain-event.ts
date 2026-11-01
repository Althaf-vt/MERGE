import { DomainEvent } from "../../../../shared/domain/events/domain-events.interface";
import { CONNECTION_DOMAIN_EVENTS } from "../constants/connection.constants";

export class ConnectionAcceptedDomainEvent implements DomainEvent {
    public readonly occuredOn: Date = new Date();
    public readonly eventName: string = CONNECTION_DOMAIN_EVENTS.ACCEPTED;

    constructor(
        public readonly connectionId: string,
        public readonly requesterId: string,
        public readonly recipientId: string,
    ) { }
}
