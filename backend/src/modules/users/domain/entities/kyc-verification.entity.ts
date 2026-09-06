import { DocumentType, ReviewDecision, SelfieVerificationStatus, VerificationDevice, VerificationStatus } from "../enums/user.enums";

export interface UserKycProps{
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
    livenessResults?: Array<{
        prompt: string;
        score: number;
        status: string;
        videoS3?: string;
    }>;
    verificationSubmitted?: boolean;
    manualReviewRequired?: boolean;
    adminReviewedBy?: string;
    rejectionReason?: string;
    submittedAt?: Date;
    approvedAt?: Date;
    rejectedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface SubmitPkiDocumentsPayload{
    documentType: DocumentType;
    issuingCountry: string;
    legalName: string;
    verifiedDOB: Date;
    hashedDocumentNumber: string;
}

export interface RecordSelfiePayload{
    liveSelfieS3: string;
    selfieFaceEmbedding: number[];
    selfieConfidence: number;
    rejectionReason?: string;
}

export interface RecordLivenessPayload{
    prompt: string;
    score: number;
    videoS3?: string;
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
            selfieVerificationStatus: props.selfieVerificationStatus ?? SelfieVerificationStatus.NOT_STARTED,
        }
    }

    get id(): string | undefined {return this.props.id};
    get userId(): string | undefined {return this.props.userId};
    get verificationStatus(): VerificationStatus | undefined {return this.props.verificationStatus};
    get reviewDecision(): ReviewDecision | undefined {return this.props.reviewDecision};
    get verificationAttempt(): number | undefined {return this.props.verificationAttempt};
    get documentType(): DocumentType | undefined {return this.props.documentType};
    get issuingCountry(): string | undefined {return this.props.issuingCountry};
    get verificationDevice(): VerificationDevice | undefined {return this.props.verificationDevice};
    get qrSessionId(): string | undefined {return this.props.qrSessionId};
    get legalName(): string | undefined {return this.props.legalName};
    get verifiedDOB(): Date | undefined {return this.props.verifiedDOB};
    get hashedDocumentNumber(): string | undefined {return this.props.hashedDocumentNumber};
    get liveSelfieS3(): string | undefined {return this.props.liveSelfieS3};
    get selfieFaceEmbedding(): number[] | undefined {return this.props.selfieFaceEmbedding};
    get selfieVerificationStatus(): SelfieVerificationStatus | undefined {return this.props.selfieVerificationStatus};
    get selfieConfidence(): number | undefined {return this.props.selfieConfidence};
    get livenessResults(): any[] | undefined { return this.props.livenessResults; }
    get verificationSubmitted(): boolean | undefined { return this.props.verificationSubmitted; }
    // Returns an array of prompt names that have successfully passed
    get passedPrompts(): string[] {
        return this.props.livenessResults
            ?.filter(r => r.status === 'PASSED')
            .map(r => r.prompt) ?? [];
    }
    get manualReviewRequired(): boolean | undefined {return this.props.manualReviewRequired};
    get adminReviewedBy(): string | undefined {return this.props.adminReviewedBy};
    get rejectionReason(): string | undefined {return this.props.rejectionReason};
    get submittedAt(): Date | undefined {return this.props.submittedAt};
    get approvedAt(): Date | undefined {return this.props.approvedAt};
    get rejectedAt(): Date | undefined {return this.props.rejectedAt};
    get createdAt(): Date | undefined {return this.props.createdAt};
    get updatedAt(): Date | undefined {return this.props.updatedAt};

    // Instant PKI validation
    recordPkiValidation(payload: SubmitPkiDocumentsPayload): void{
        this.props.documentType = payload.documentType;
        this.props.issuingCountry = payload.issuingCountry;
        this.props.legalName = payload.legalName;
        this.props.verifiedDOB = payload.verifiedDOB;
        this.props.hashedDocumentNumber = payload.hashedDocumentNumber;

        // Auto-approve upon successful cryptographic validation
        this.props.verificationStatus = VerificationStatus.APPROVED;
        this.props.verificationAttempt = (this.props.verificationAttempt ?? 0) + 1;
        this.props.submittedAt = new Date();
        this.props.updatedAt = new Date();
    }

    // Live Selfie
    recordSelfie(payload: RecordSelfiePayload, selfieThreshold = 85): void{
        
        // Always save the S3 link and confidence, regardless of pass/fail, for audit logs
        this.props.liveSelfieS3 = payload.liveSelfieS3;
        this.props.selfieConfidence = payload.selfieConfidence;
        this.props.updatedAt = new Date();
        
        if(payload.selfieConfidence >= selfieThreshold){
            this.props.selfieFaceEmbedding = payload.selfieFaceEmbedding;
            this.props.selfieVerificationStatus = SelfieVerificationStatus.APPROVED;
        }else{
            this.props.selfieVerificationStatus = SelfieVerificationStatus.REJECTED;
            this.props.verificationStatus = VerificationStatus.REJECTED;
            this.props.rejectionReason = payload.rejectionReason;
        }
        
    }

    // Liveness Test : Evaluates a single liveness prompt incrementally
    recordLivenessPrompt(payload: RecordLivenessPayload, threshold = 0.80): void {
        if (!this.props.livenessResults) this.props.livenessResults = [];
        
        const passed = payload.score >= threshold;
        
        this.props.livenessResults.push({
            prompt: payload.prompt,
            score: payload.score,
            status: passed ? 'PASSED' : 'FAILED',
            videoS3: payload.videoS3
        });
        
        this.props.updatedAt = new Date();
    }
    
    // Resets liveness state to allow users to retake the challenge
    resetLiveness(): void {
        this.props.livenessResults = [];
        this.props.verificationSubmitted = false;
        this.props.verificationStatus = VerificationStatus.PENDING;
        this.props.reviewDecision = undefined;
        this.props.rejectionReason = undefined;
        this.props.updatedAt = new Date();
    }

    // submission gate 
    submitVerification(requiredPromptsCount = 3): void {
        const results = this.props.livenessResults ?? [];
        const hasFailedPrompts = results.some(r => r.status === 'FAILED');
        const passedCount = results.filter(r => r.status === 'PASSED').length;

        // Ensure all required steps were actually performed
        if (passedCount < requiredPromptsCount) {
            throw new Error("Cannot submit verification: Incomplete liveness prompts.");
        }

        if (hasFailedPrompts) {
            this.props.verificationStatus = VerificationStatus.REJECTED;
            this.props.reviewDecision = ReviewDecision.AUTO_REJECTED;
            this.props.rejectionReason = "One or more liveness prompts failed verification.";
        } else {
            // Forward to manual review queue or auto-approve based on system thresholds[cite: 5]
            this.props.verificationStatus = VerificationStatus.UNDER_REVIEW;
            this.props.reviewDecision = ReviewDecision.MANUAL_REVIEW;
            this.props.manualReviewRequired = true;
        }

        this.props.verificationSubmitted = true;
        this.props.submittedAt = new Date();
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