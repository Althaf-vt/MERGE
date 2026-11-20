import { IUserKycEscalatedEventPayload, KYC_ESCALATION_EVENTS } from "../../../../shared/domain/events/kyc-escalation-events.contract";

export class UserKycEscalatedDomainEvent implements IUserKycEscalatedEventPayload {
    public readonly occuredOn: Date = new Date();
    public readonly eventName: string = KYC_ESCALATION_EVENTS.USER_KYC_ESCALATED;

    constructor(
        public readonly targetUserId: string,
        public readonly documentType: string,
        public readonly issuingCountry: string,
        public readonly kycSelfieUrl: string,
        public readonly uploadedDocumentUrl: string,
        public readonly livenessScore: number,
        public readonly faceMatchScore: number
    ) { }
}
