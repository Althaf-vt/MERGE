import { KycResubmissionReason } from "../enums/kyc-resubmission-reason.enum";
import { IKycApprovedEventPayload, IKycRejectedEventPayload, IKycResubmissionRequestedEventPayload, KYC_ESCALATION_EVENTS } from "../../../../shared/domain/events/kyc-escalation-events.contract";

export class KycEscalationApprovedDomainEvent implements IKycApprovedEventPayload {
    public readonly occuredOn: Date = new Date();
    public readonly eventName: string = KYC_ESCALATION_EVENTS.ADMIN_KYC_APPROVED;

    constructor(
        public readonly targetUserId: string,
        public readonly taskId: string,
        public readonly adminId?: string,
    ) { }
}

export class KycEscalationRejectedDomainEvent implements IKycRejectedEventPayload {
    public readonly occuredOn: Date = new Date();
    public readonly eventName: string = KYC_ESCALATION_EVENTS.ADMIN_KYC_REJECTED;

    constructor(
        public readonly targetUserId: string,
        public readonly taskId: string,
        public readonly reason: string,
        public readonly adminId?: string,
    ) { }
}

export class KycEscalationResubmissionRequestedDomainEvent implements IKycResubmissionRequestedEventPayload {
    public readonly occuredOn: Date = new Date();
    public readonly eventName: string = KYC_ESCALATION_EVENTS.ADMIN_KYC_RESUBMISSION_REQUESTED;

    constructor(
        public readonly targetUserId: string,
        public readonly taskId: string,
        public readonly reasons: KycResubmissionReason[],
        public readonly message?: string,
        public readonly adminId?: string,
    ) { }
}