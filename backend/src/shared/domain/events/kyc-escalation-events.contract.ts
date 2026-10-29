import { DomainEvent } from "./domain-events.interface";

// Centralized cross-module event names for KYC Escalations
export const KYC_ESCALATION_EVENTS = {
    ADMIN_KYC_APPROVED: 'admin.kyc_escalation.approved',
    ADMIN_KYC_REJECTED: 'admin.kyc_escalation.rejected',
    ADMIN_KYC_RESUBMISSION_REQUESTED: 'admin.kyc_escalation.resubmission_requested',
} as const;

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