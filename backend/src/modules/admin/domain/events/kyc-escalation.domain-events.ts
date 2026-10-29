import { DomainEvent } from "../../../../shared/domain/events/domain-events.interface";

export class KycEscalationApprovedDomainEvent implements DomainEvent {
    public readonly occuredOn: Date = new Date();
    public readonly eventName: string = 'admin.kyc_escalation.approved';

    constructor(
        public readonly targetUserId: string,
        public readonly taskId: string,
    ) { }
}

export class KycEscalationRejectedDomainEvent implements DomainEvent {
    public readonly occuredOn: Date = new Date();
    public readonly eventName: string = 'admin.kyc_escalation.rejected';

    constructor(
        public readonly targetUserId: string,
        public readonly taskId: string,
        public readonly reason: string
    ) { }
}