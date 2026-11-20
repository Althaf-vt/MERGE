import { DomainEvent } from "./domain-events.interface";

export const KYC_ESCALATION_EVENTS = {
    USER_KYC_ESCALATED: 'user.kyc.escalated',
    ADMIN_KYC_APPROVED: 'admin.kyc_escalation.approved',
    ADMIN_KYC_REJECTED: 'admin.kyc_escalation.rejected',
    ADMIN_KYC_RESUBMISSION_REQUESTED: 'admin.kyc_escalation.resubmission_requested',
} as const;

export interface IUserKycEscalatedEventPayload extends DomainEvent {
    readonly targetUserId: string;
    readonly documentType: string;
    readonly issuingCountry: string;
    readonly kycSelfieUrl: string;
    readonly uploadedDocumentUrl: string;
    readonly livenessScore: number;
    readonly faceMatchScore: number;
}

export interface IKycApprovedEventPayload extends DomainEvent {
    readonly targetUserId: string;
    readonly taskId: string;
    readonly adminId?: string;
}

export interface IKycRejectedEventPayload extends DomainEvent {
    readonly targetUserId: string;
    readonly taskId: string;
    readonly reason: string;
    readonly adminId?: string;
}

export interface IKycResubmissionRequestedEventPayload extends DomainEvent {
    readonly targetUserId: string;
    readonly taskId: string;
    readonly reasons: string[];
    readonly message?: string;
    readonly adminId?: string;
}