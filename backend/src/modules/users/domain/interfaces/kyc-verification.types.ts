import {
    DocumentType,
    KycResubmissionReason,
    ReviewDecision,
    SelfieVerificationStatus,
    VerificationDevice,
    VerificationStatus,
} from "../enums/user.enums";

export interface LivenessEvaluationRecord {
    prompt: string;
    score: number;
    status: string;
    videoS3?: string;
}

export interface UserKycProps {
    id?: string;
    userId?: string;
    verificationStatus?: VerificationStatus;
    reviewDecision?: ReviewDecision;
    verificationAttempt?: number;
    documentType?: DocumentType;
    issuingCountry?: string;
    verificationDevice?: VerificationDevice;
    qrSessionId?: string;
    legalName?: string;
    verifiedDOB?: Date;
    hashedDocumentNumber?: string;
    liveSelfieS3?: string;
    selfieFaceEmbedding?: number[];
    selfieConfidence?: number;
    selfieVerificationStatus?: SelfieVerificationStatus;
    livenessResults?: LivenessEvaluationRecord[];
    verificationSubmitted?: boolean;
    manualReviewRequired?: boolean;
    adminReviewedBy?: string;
    rejectionReason?: string;
    resubmissionReasons?: (KycResubmissionReason | string)[];
    resubmissionMessage?: string;
    resubmissionRequestedAt?: Date;
    submittedAt?: Date;
    approvedAt?: Date;
    rejectedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface SubmitPkiDocumentsPayload {
    documentType: DocumentType;
    issuingCountry: string;
    legalName: string;
    verifiedDOB: Date;
    hashedDocumentNumber: string;
}

export interface RecordSelfiePayload {
    liveSelfieS3: string;
    selfieFaceEmbedding: number[];
    selfieConfidence: number;
    rejectionReason?: string;
}

export interface RecordLivenessPayload {
    prompt: string;
    score: number;
    videoS3?: string;
}

export interface ApproveManualReviewPayload {
    adminId: string;
}

export interface RejectManualReviewPayload {
    adminId: string;
    rejectionReason: string;
}

export interface RequestResubmissionPayload {
    adminId: string;
    reasons: (KycResubmissionReason | string)[];
    message?: string;
}

export interface UserKycSnapshot {
    id?: string;
    userId?: string;
    verificationStatus?: VerificationStatus;
    reviewDecision?: ReviewDecision;
    verificationAttempt?: number;
    documentType?: DocumentType;
    issuingCountry?: string;
    verificationDevice?: VerificationDevice;
    qrSessionId?: string;
    legalName?: string;
    verifiedDOB?: Date;
    hashedDocumentNumber?: string;
    liveSelfieS3?: string;
    selfieFaceEmbedding?: number[];
    selfieConfidence?: number;
    selfieVerificationStatus?: SelfieVerificationStatus;
    livenessResults?: LivenessEvaluationRecord[];
    verificationSubmitted?: boolean;
    manualReviewRequired?: boolean;
    adminReviewedBy?: string;
    rejectionReason?: string;
    resubmissionReasons?: (KycResubmissionReason | string)[];
    resubmissionMessage?: string;
    resubmissionRequestedAt?: Date;
    submittedAt?: Date;
    approvedAt?: Date;
    rejectedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
    [key: string]: unknown;
}
