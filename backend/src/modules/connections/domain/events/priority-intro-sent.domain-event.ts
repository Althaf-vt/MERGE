import { DomainEvent } from "../../../../shared/domain/events/domain-events.interface";
import { PRIORITY_INTRO_DOMAIN_EVENTS } from "../constants/priority-intro.constants";

export class PriorityIntroSentDomainEvent implements DomainEvent {
    public readonly occuredOn: Date = new Date();
    public readonly eventName: string = PRIORITY_INTRO_DOMAIN_EVENTS.SENT;

    constructor(
        public readonly senderId: string,
        public readonly recipientId: string,
    ) { }
}