import { ClaimDetailsVO } from "../value-objects/claim-details.vo";
import { ClaimDetailsSnapshot } from "./claim-details.types";
import { KycResubmissionReason } from "../enums/kyc-resubmission-reason.enum";
import { KycTaskStatus } from "../enums/kyc-task-status.enum";

export interface KycEscalationTaskProps {
    id?: string;
    targetUserId: string;
    documentType: string;
    issuingCountry: string;
    kycSelfieUrl: string;
    uploadedDocumentUrl: string;
    livenessScore: number;
    faceMatchScore: number;
    taskStatus?: KycTaskStatus;
    claimDetails?: ClaimDetailsVO;
    rejectionReason?: string;
    resubmissionReasons?: KycResubmissionReason[];
    resubmissionMessage?: string | null;
    resolvedAt?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface KycEscalationTaskSnapshot {
    id: string;
    targetUserId: string;
    documentType: string;
    issuingCountry: string;
    kycSelfieUrl: string;
    uploadedDocumentUrl: string;
    livenessScore: number;
    faceMatchScore: number;
    taskStatus: KycTaskStatus;
    claimDetails: ClaimDetailsSnapshot;
    rejectionReason?: string;
    resubmissionReasons?: KycResubmissionReason[];
    resubmissionMessage?: string | null;
    resolvedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface RejectKycTaskPayload {
    adminId: string;
    isSuperAdmin: boolean;
    reason: string;
}

export interface RequestKycResubmissionPayload {
    adminId: string;
    isSuperAdmin: boolean;
    reasons: KycResubmissionReason[];
    message?: string;
}
