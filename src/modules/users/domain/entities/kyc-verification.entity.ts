import { DocumentType, ReviewDecision, VerificationDevice, VerificationStatus } from "../enums/user.enums";

export interface UserKycProps{
    id?: string;
    userId?: string;
    verificationStatus?: VerificationStatus;
    reviewDecision?: ReviewDecision;
    verificationAttempt?: number;
    documentType?: DocumentType;
    issuingCountry?: string;
    documentFrontS3?: string;
    documentBackS3?: string;
    verificationDevice?: VerificationDevice;
    qrSessionId?: string;
    legalName?: string;
    verifiedDOB?: Date;
    hashedDocumentNumber?: string;
    ocrConfidence?: number;
    liveSelfieS3?: string;
    selfieFaceEmbedding?: number[];
    livenessScore?: number;
    duplicateDetected?: boolean;
    duplicateUserId?: string;
    manualReviewRequired?: boolean;
    adminReviewedBy?: string;
    rejectionReason?: string;
    submittedAt?: Date;
    approvedAt?: Date;
    rejectedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface SubmitDocumentsPayload{
    documentType: DocumentType;
    issuingCountry: string;
    documentFrontS3: string;
    documentBackS3: string;
    verificationDevice: VerificationDevice;
    qrSessionId: string;
}

export interface RecordOcrResultPayload{
    legalName: string;
    verifiedDOB: Date;
    hashedDocumentNumber: string;
    ocrConfidence: number;
}

export interface RecordBiometricResultPayload{
    liveSelfieS3: string;
    selfieFaceEmbedding: number[];
    livenessScore: number;
    duplicateDetected: boolean;
    duplicateUserId?: string;
}

export interface ApproveManualReviewPayload{
    adminId: string;
}

export interface RejectManualReviewPayload{
    adminId: string;
    rejectionReason: string;
}



export class UserKyc{
    private props: UserKycProps;

    constructor(props: UserKycProps){
        this.props = {
            ...props,
            verificationStatus: props.verificationStatus ?? VerificationStatus.NOT_STARTED,
            verificationAttempt: props.verificationAttempt ?? 0,
            verificationDevice: props.verificationDevice ?? VerificationDevice.CURRENT_DEVICE,
            selfieFaceEmbedding: props.selfieFaceEmbedding ?? [],
        }
    }

    get id(): string | undefined {return this.props.id};
    get userId(): string | undefined {return this.props.userId};
    get verificationStatus(): VerificationStatus | undefined {return this.props.verificationStatus};
    get reviewDecision(): ReviewDecision | undefined {return this.props.reviewDecision};
    get verificationAttempt(): number | undefined {return this.props.verificationAttempt};
    get documentType(): DocumentType | undefined {return this.props.documentType};
    get issuingCountry(): string | undefined {return this.props.issuingCountry};
    get documentFrontS3(): string | undefined {return this.props.documentFrontS3};
    get documentBackS3(): string | undefined {return this.props.documentBackS3};
    get verificationDevice(): VerificationDevice | undefined {return this.props.verificationDevice};
    get qrSessionId(): string | undefined {return this.props.qrSessionId};
    get legalName(): string | undefined {return this.props.legalName};
    get verifiedDOB(): Date | undefined {return this.props.verifiedDOB};
    get hashedDocumentNumber(): string | undefined {return this.props.hashedDocumentNumber};
    get ocrConfidence(): number | undefined {return this.props.ocrConfidence};
    get liveSelfieS3(): string | undefined {return this.props.liveSelfieS3};
    get selfieFaceEmbedding(): number[] | undefined {return this.props.selfieFaceEmbedding};
    get livenessScore(): number | undefined {return this.props.livenessScore};
    get duplicateFaceDetected(): boolean | undefined {return this.props.duplicateDetected};
    get duplicateUserId(): string | undefined {return this.props.duplicateUserId};
    get adminReviewedBy(): string | undefined {return this.props.adminReviewedBy};
    get rejectionReason(): string | undefined {return this.props.rejectionReason};
    get submittedAt(): Date | undefined {return this.props.submittedAt};
    get approvedAt(): Date | undefined {return this.props.approvedAt};
    get rejectedAt(): Date | undefined {return this.props.rejectedAt};
    get createdAt(): Date | undefined {return this.props.createdAt};
    get updatedAt(): Date | undefined {return this.props.updatedAt};

    submitDocuments(payload: SubmitDocumentsPayload): void{
        this.props.documentType = payload.documentType;
        this.props.issuingCountry = payload.issuingCountry;
        this.props.documentFrontS3 = payload.documentFrontS3;
        this.props.documentBackS3 = payload.documentBackS3;
        this.props.verificationDevice = payload.verificationDevice;
        this.props.qrSessionId = payload.qrSessionId;

        this.props.verificationStatus = VerificationStatus.PENDING;
        this.props.verificationAttempt = (this.props.verificationAttempt ?? 0) + 1;
        this.props.submittedAt = new Date();
        this.props.updatedAt = new Date();
    }

    // OCR extraction and blacklist check

    recordOcrResult(payload: RecordOcrResultPayload): void{
        this.props.legalName = payload.legalName;
        this.props.verifiedDOB = payload.verifiedDOB;
        this.props.hashedDocumentNumber = payload.hashedDocumentNumber;
        this.props.ocrConfidence = payload.ocrConfidence;
        this.props.updatedAt = new Date();
    }

    recordBiometricsAndEvaluate(
        payload: RecordBiometricResultPayload,
        livenessThreshold = 0.8
    ): void{
        this.props.liveSelfieS3 = payload.liveSelfieS3;
        this.props.selfieFaceEmbedding = payload.selfieFaceEmbedding;
        this.props.livenessScore = payload.livenessScore;
        this.props.duplicateDetected = payload.duplicateDetected;
        this.props.duplicateUserId = payload.duplicateUserId;

        const passedLiveness = payload.livenessScore >= livenessThreshold;
        const noDuplicate = !payload.duplicateDetected;

        if(passedLiveness && noDuplicate){
            this.props.verificationStatus = VerificationStatus.APPROVED;
            this.props.reviewDecision = ReviewDecision.AUTO_APPROVED;
            this.props.approvedAt = new Date();
            this.props.manualReviewRequired = false;
        }else{
            this.props.verificationStatus = VerificationStatus.UNDER_REVIEW;
            this.props.reviewDecision = ReviewDecision.MANUAL_REVIEW;
            this.props.manualReviewRequired = true;
        }

        this.props.updatedAt = new Date();
    }

    approveManualReview(payload: ApproveManualReviewPayload){
        if(this.props.verificationStatus !== VerificationStatus.UNDER_REVIEW){
            throw new Error('KYC verification is not in a reviewable state');
        }

        this.props.verificationStatus = VerificationStatus.APPROVED;
        this.props.reviewDecision = ReviewDecision.MANUAL_APPROVED;
        this.props.adminReviewedBy = payload.adminId;
        this.props.manualReviewRequired = false;
        this.props.approvedAt = new Date();
        this.props.rejectionReason = undefined;
        this.props.updatedAt = new Date();
    }

    rejectManualReview(payload: RejectManualReviewPayload){
        if(this.props.verificationStatus !== VerificationStatus.UNDER_REVIEW){
            throw new Error('KYC verification is not in a reviewable state');
        }

        if(!payload.rejectionReason || payload.rejectionReason.trim().length === 0){
            throw new Error('Rejection reason is requires when rejecting KYC');
        }


        this.props.verificationStatus = VerificationStatus.REJECTED;
        this.props.reviewDecision = ReviewDecision.MANUAL_REJECTED;
        this.props.adminReviewedBy = payload.adminId;
        this.props.manualReviewRequired = false;
        this.props.rejectionReason = payload.rejectionReason;
        this.props.rejectedAt = new Date();
        this.props.updatedAt = new Date();
    }

    toJSON(){
        return {...this.props};
    }
}