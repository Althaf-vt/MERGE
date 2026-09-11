import { DocumentType, ReviewDecision, SelfieVerificationStatus, VerificationDevice, VerificationStatus } from "../enums/user.enums";
import { DomainException } from "../exceptions/domain.exception";
import { ErrorCode } from "../enums/error-code.enum";

// Encapsulates individual liveness challenge evaluations within 
// the KYC aggregate to prevent primitive obsession.
export interface LivenessEvaluationRecord{
    prompt: string;
    score: number;
    status: string;
    videoS3: string;
}

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
    private _props: UserKycProps;

    private readonly _REQUIRED_PROMPTS_COUNT = 4;
    private readonly _SELFIE_MIN_PASS_THRESHOLD = 80;
    private readonly _SELFIE_AUTO_APPROVE_THRESHOLD = 90;
    private readonly _LIVENESS_MIN_PASS_THRESHOLD = 0.80;
    private readonly _LIVENESS_AUTO_APPROVE_THRESHOLD = 0.88;

    constructor(props: UserKycProps){
        this._props = {
            ...props,
            verificationStatus: props.verificationStatus ?? VerificationStatus.NOT_STARTED,
            verificationAttempt: props.verificationAttempt ?? 0,
            verificationDevice: props.verificationDevice ?? VerificationDevice.CURRENT_DEVICE,
            selfieFaceEmbedding: props.selfieFaceEmbedding ?? [],
            selfieVerificationStatus: props.selfieVerificationStatus ?? SelfieVerificationStatus.NOT_STARTED,
        }
    }

    get id(): string | undefined {return this._props.id};
    get userId(): string | undefined {return this._props.userId};
    get verificationStatus(): VerificationStatus | undefined {return this._props.verificationStatus};
    get reviewDecision(): ReviewDecision | undefined {return this._props.reviewDecision};
    get verificationAttempt(): number | undefined {return this._props.verificationAttempt};
    get documentType(): DocumentType | undefined {return this._props.documentType};
    get issuingCountry(): string | undefined {return this._props.issuingCountry};
    get verificationDevice(): VerificationDevice | undefined {return this._props.verificationDevice};
    get qrSessionId(): string | undefined {return this._props.qrSessionId};
    get legalName(): string | undefined {return this._props.legalName};
    get verifiedDOB(): Date | undefined {return this._props.verifiedDOB};
    get hashedDocumentNumber(): string | undefined {return this._props.hashedDocumentNumber};
    get liveSelfieS3(): string | undefined {return this._props.liveSelfieS3};
    get selfieFaceEmbedding(): number[] | undefined {return this._props.selfieFaceEmbedding};
    get selfieVerificationStatus(): SelfieVerificationStatus | undefined {return this._props.selfieVerificationStatus};
    get selfieConfidence(): number | undefined {return this._props.selfieConfidence};
    get livenessResults(): any[] | undefined { return this._props.livenessResults; }
    get verificationSubmitted(): boolean | undefined { return this._props.verificationSubmitted; }
    // Returns an array of prompt names that have successfully passed
    get passedPrompts(): string[] {
        return this._props.livenessResults
            ?.filter(r => r.status === 'PASSED')
            .map(r => r.prompt) ?? [];
    }
    get manualReviewRequired(): boolean | undefined {return this._props.manualReviewRequired};
    get adminReviewedBy(): string | undefined {return this._props.adminReviewedBy};
    get rejectionReason(): string | undefined {return this._props.rejectionReason};
    get submittedAt(): Date | undefined {return this._props.submittedAt};
    get approvedAt(): Date | undefined {return this._props.approvedAt};
    get rejectedAt(): Date | undefined {return this._props.rejectedAt};
    get createdAt(): Date | undefined {return this._props.createdAt};
    get updatedAt(): Date | undefined {return this._props.updatedAt};

    // Instant PKI validation
    recordPkiValidation(payload: SubmitPkiDocumentsPayload): void{
        this._props.documentType = payload.documentType;
        this._props.issuingCountry = payload.issuingCountry;
        this._props.legalName = payload.legalName;
        this._props.verifiedDOB = payload.verifiedDOB;
        this._props.hashedDocumentNumber = payload.hashedDocumentNumber;

        // Auto-approve upon successful cryptographic validation
        this._props.verificationStatus = VerificationStatus.APPROVED;
        this._props.verificationAttempt = (this._props.verificationAttempt ?? 0) + 1;
        this._props.submittedAt = new Date();
        this._props.updatedAt = new Date();
    }

    // Live Selfie
    recordSelfie(payload: RecordSelfiePayload): void{
        
        // Always save the S3 link and confidence, regardless of pass/fail, for audit logs
        this._props.liveSelfieS3 = payload.liveSelfieS3;
        this._props.selfieConfidence = payload.selfieConfidence;
        this._props.updatedAt = new Date();
        
        if(payload.selfieConfidence >= this._SELFIE_MIN_PASS_THRESHOLD){
            this._props.selfieFaceEmbedding = payload.selfieFaceEmbedding;
            this._props.selfieVerificationStatus = SelfieVerificationStatus.APPROVED;
        }else{
            this._props.selfieVerificationStatus = SelfieVerificationStatus.REJECTED;
            this._props.rejectionReason = payload.rejectionReason || "Face not clearly visible or poor lighting";
        }
        
    }

    // Liveness Test : Evaluates a single liveness prompt incrementally
    recordLivenessPrompt(payload: RecordLivenessPayload): void {
        if (!this._props.livenessResults) this._props.livenessResults = [];
        
        const passed = payload.score >= this._LIVENESS_MIN_PASS_THRESHOLD;
        
        this._props.livenessResults.push({
            prompt: payload.prompt,
            score: payload.score,
            status: passed ? 'PASSED' : 'FAILED',
            videoS3: payload.videoS3
        });
        
        this._props.updatedAt = new Date();
    }
    
    // Resets liveness state to allow users to retake the challenge
    resetLiveness(): void {
        this._props.livenessResults = [];
        this._props.verificationSubmitted = false;
        this._props.verificationStatus = VerificationStatus.APPROVED;
        this._props.reviewDecision = undefined;
        this._props.rejectionReason = undefined;
        this._props.updatedAt = new Date();
    }

    // submission gate 
    submitVerification(): void {
        const results = this._props.livenessResults ?? [];
        
        // DDD Encapsulation: The entity decides how to interpret historical data.
        // Group by prompt so we only evaluate the user's most recent attempt for each action.
        const latestResultsMap = new Map<string, any>();
        for (const record of results) {
            latestResultsMap.set(record.prompt, record);
        }
        
        const latestResults = Array.from(latestResultsMap.values());
        
        const hasFailedPrompts = latestResults.some(r => r.status === 'FAILED');
        const passedCount = latestResults.filter(r => r.status === 'PASSED').length;

        // Ensure all required steps were actually performed
        if (passedCount < this._REQUIRED_PROMPTS_COUNT) {
            throw new DomainException(ErrorCode.LIVENESS_CHECK_FAILED, `Cannot submit verification: Incomplete liveness prompts. Expected ${this._REQUIRED_PROMPTS_COUNT}, got ${passedCount}.`);
        }

        if (hasFailedPrompts) {
            this._props.verificationStatus = VerificationStatus.REJECTED;
            this._props.reviewDecision = ReviewDecision.AUTO_REJECTED;
            this._props.rejectionReason = "One or more liveness prompts failed verification.";
        } else {

            // Calculate aggregate scores to determine if we can bypass manual review
            const averageLivenessScore = latestResults.reduce((acc,curr) => acc + curr.score, 0) / passedCount;
            const selfieConfidence = this._props.selfieConfidence ?? 0;

            // Auto approve if both metrics exceed our strict trust threshold
            if(averageLivenessScore >= this._LIVENESS_AUTO_APPROVE_THRESHOLD && selfieConfidence >= this._SELFIE_AUTO_APPROVE_THRESHOLD){
                this._props.verificationStatus = VerificationStatus.APPROVED;
                this._props.reviewDecision = ReviewDecision.AUTO_APPROVED;
                this._props.manualReviewRequired = false;
            }else{
                // Forward to manual review queue or auto-approve based on system thresholds
                this._props.verificationStatus = VerificationStatus.UNDER_REVIEW;
                this._props.reviewDecision = ReviewDecision.MANUAL_REVIEW;
                this._props.manualReviewRequired = true;
            }

        }

        this._props.verificationSubmitted = true;
        this._props.submittedAt = new Date();
        this._props.updatedAt = new Date();
    }

    approveManualReview(payload: ApproveManualReviewPayload){
        if(this._props.verificationStatus !== VerificationStatus.UNDER_REVIEW){
            throw new DomainException(ErrorCode.VALIDATION_FAILED, 'KYC verification is not in a reviewable state');
        }

        this._props.verificationStatus = VerificationStatus.APPROVED;
        this._props.reviewDecision = ReviewDecision.MANUAL_APPROVED;
        this._props.adminReviewedBy = payload.adminId;
        this._props.manualReviewRequired = false;
        this._props.approvedAt = new Date();
        this._props.rejectionReason = undefined;
        this._props.updatedAt = new Date();
    }

    rejectManualReview(payload: RejectManualReviewPayload){
        if(this._props.verificationStatus !== VerificationStatus.UNDER_REVIEW){
            throw new DomainException(ErrorCode.VALIDATION_FAILED, 'KYC verification is not in a reviewable state');
        }

        if(!payload.rejectionReason || payload.rejectionReason.trim().length === 0){
            throw new DomainException(ErrorCode.VALIDATION_FAILED, 'Rejection reason is required when rejecting KYC');
        }


        this._props.verificationStatus = VerificationStatus.REJECTED;
        this._props.reviewDecision = ReviewDecision.MANUAL_REJECTED;
        this._props.adminReviewedBy = payload.adminId;
        this._props.manualReviewRequired = false;
        this._props.rejectionReason = payload.rejectionReason;
        this._props.rejectedAt = new Date();
        this._props.updatedAt = new Date();
    }

    toJSON(){
        return {...this._props};
    }
}