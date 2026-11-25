import { DocumentType, KycResubmissionReason, ReviewDecision, SelfieVerificationStatus, VerificationDevice, VerificationStatus } from "../enums/user.enums";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { PhotoVerificationStatus } from "../enums/profile.enums";
import { KYC_POLICY } from "../constants/kyc-policy.constant";
import { USER_ERROR_MESSAGES } from "../constants/user-error-messages.constant";
import {
    ApproveManualReviewPayload,
    RecordLivenessPayload,
    RecordSelfiePayload,
    RejectManualReviewPayload,
    RequestResubmissionPayload,
    SubmitPkiDocumentsPayload,
    UserKycProps,
    UserKycSnapshot,
} from "../interfaces/kyc-verification.types";

export class UserKyc {
    private _props: UserKycProps;

    constructor(props: UserKycProps) {
        this._props = {
            ...props,
            verificationStatus: props.verificationStatus ?? VerificationStatus.NOT_STARTED,
            verificationAttempt: props.verificationAttempt ?? 0,
            verificationDevice: props.verificationDevice ?? VerificationDevice.CURRENT_DEVICE,
            selfieFaceEmbedding: props.selfieFaceEmbedding ?? [],
            selfieVerificationStatus: props.selfieVerificationStatus ?? SelfieVerificationStatus.NOT_STARTED,
        };
    }

    get id(): string | undefined { return this._props.id; }
    get userId(): string | undefined { return this._props.userId; }
    get verificationStatus(): VerificationStatus | undefined { return this._props.verificationStatus; }
    get reviewDecision(): ReviewDecision | undefined { return this._props.reviewDecision; }
    get verificationAttempt(): number | undefined { return this._props.verificationAttempt; }
    get documentType(): DocumentType | undefined { return this._props.documentType; }
    get issuingCountry(): string | undefined { return this._props.issuingCountry; }
    get verificationDevice(): VerificationDevice | undefined { return this._props.verificationDevice; }
    get qrSessionId(): string | undefined { return this._props.qrSessionId; }
    get legalName(): string | undefined { return this._props.legalName; }
    get verifiedDOB(): Date | undefined { return this._props.verifiedDOB; }
    get hashedDocumentNumber(): string | undefined { return this._props.hashedDocumentNumber; }
    get liveSelfieS3(): string | undefined { return this._props.liveSelfieS3; }
    get selfieFaceEmbedding(): number[] | undefined { return this._props.selfieFaceEmbedding; }
    get selfieVerificationStatus(): SelfieVerificationStatus | undefined { return this._props.selfieVerificationStatus; }
    get selfieConfidence(): number | undefined { return this._props.selfieConfidence; }
    get livenessResults(): UserKycProps['livenessResults'] { return this._props.livenessResults; }
    get verificationSubmitted(): boolean | undefined { return this._props.verificationSubmitted; }

    // Returns an array of prompt names that have successfully passed
    get passedPrompts(): string[] {
        return this._props.livenessResults
            ?.filter(r => r.status === 'PASSED')
            .map(r => r.prompt) ?? [];
    }

    get manualReviewRequired(): boolean | undefined { return this._props.manualReviewRequired; }
    get adminReviewedBy(): string | undefined { return this._props.adminReviewedBy; }
    get rejectionReason(): string | undefined { return this._props.rejectionReason; }
    get resubmissionReasons(): string[] | undefined { return this._props.resubmissionReasons; }
    get resubmissionMessage(): string | undefined { return this._props.resubmissionMessage; }
    get resubmissionRequestedAt(): Date | undefined { return this._props.resubmissionRequestedAt; }
    get submittedAt(): Date | undefined { return this._props.submittedAt; }
    get approvedAt(): Date | undefined { return this._props.approvedAt; }
    get rejectedAt(): Date | undefined { return this._props.rejectedAt; }
    get createdAt(): Date | undefined { return this._props.createdAt; }
    get updatedAt(): Date | undefined { return this._props.updatedAt; }

    public hasValidDocument(): boolean {
        return !!this._props.documentType && (!!this._props.hashedDocumentNumber || !!this._props.legalName);
    }

    public hasApprovedBiometrics(): boolean {
        const passedCount = (this._props.livenessResults ?? []).filter(r => r.status === 'PASSED').length;
        return this._props.selfieVerificationStatus === SelfieVerificationStatus.APPROVED && passedCount >= 4;
    }

    // Instant PKI validation
    recordPkiValidation(payload: SubmitPkiDocumentsPayload): void {
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
    recordSelfie(payload: RecordSelfiePayload): void {
        // Always save the S3 link and confidence, regardless of pass/fail, for audit logs
        this._props.liveSelfieS3 = payload.liveSelfieS3;
        this._props.selfieConfidence = payload.selfieConfidence;
        this._props.updatedAt = new Date();

        if (payload.selfieConfidence >= KYC_POLICY.SELFIE_MIN_PASS_THRESHOLD) {
            this._props.selfieFaceEmbedding = payload.selfieFaceEmbedding;
            this._props.selfieVerificationStatus = SelfieVerificationStatus.APPROVED;
        } else {
            this._props.selfieVerificationStatus = SelfieVerificationStatus.REJECTED;
            this._props.rejectionReason = payload.rejectionReason || USER_ERROR_MESSAGES.SELFIE_DEFAULT_REJECTION_REASON;
        }
    }

    // Liveness Test : Evaluates a single liveness prompt incrementally
    recordLivenessPrompt(payload: RecordLivenessPayload): void {
        if (!this._props.livenessResults) this._props.livenessResults = [];

        const passed = payload.score >= KYC_POLICY.LIVENESS_MIN_PASS_THRESHOLD;

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
        const latestResultsMap = new Map<string, NonNullable<UserKycProps['livenessResults']>[number]>();
        for (const record of results) {
            latestResultsMap.set(record.prompt, record);
        }

        const latestResults = Array.from(latestResultsMap.values());

        const hasFailedPrompts = latestResults.some(r => r.status === 'FAILED');
        const passedCount = latestResults.filter(r => r.status === 'PASSED').length;

        // Ensure all required steps were actually performed
        if (passedCount < KYC_POLICY.REQUIRED_PROMPTS_COUNT) {
            throw new DomainException(ErrorCode.LIVENESS_CHECK_FAILED, USER_ERROR_MESSAGES.INCOMPLETE_LIVENESS_PROMPTS(KYC_POLICY.REQUIRED_PROMPTS_COUNT, passedCount));
        }

        if (hasFailedPrompts) {
            this._props.verificationStatus = VerificationStatus.REJECTED;
            this._props.reviewDecision = ReviewDecision.AUTO_REJECTED;
            this._props.rejectionReason = USER_ERROR_MESSAGES.LIVENESS_PROMPTS_FAILED;
        } else {
            // Calculate aggregate scores to determine if we can bypass manual review
            const averageLivenessScore = latestResults.reduce((acc, curr) => acc + curr.score, 0) / passedCount;
            const selfieConfidence = this._props.selfieConfidence ?? 0;

            // Auto approve if both metrics exceed our strict trust threshold
            if (averageLivenessScore >= KYC_POLICY.LIVENESS_AUTO_APPROVE_THRESHOLD && selfieConfidence >= KYC_POLICY.SELFIE_AUTO_APPROVE_THRESHOLD) {
                this._props.verificationStatus = VerificationStatus.APPROVED;
                this._props.reviewDecision = ReviewDecision.AUTO_APPROVED;
                this._props.manualReviewRequired = false;
            } else {
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

    evaluateFaceMatch(newEmbedding: number[], confidence: number): { score: number, status: PhotoVerificationStatus } {
        const baseline = this._props.selfieFaceEmbedding;

        if (!baseline || baseline.length === 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, USER_ERROR_MESSAGES.KYC_BIOMETRIC_BASELINE_MISSING);
        }

        if (baseline.length !== newEmbedding.length) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, USER_ERROR_MESSAGES.EMBEDDING_DIMENSION_MISMATCH);
        }

        if (!newEmbedding || newEmbedding.length === 0 || confidence < KYC_POLICY.MIN_FACE_MATCH_CONFIDENCE || baseline.length !== newEmbedding.length) {
            return { score: KYC_POLICY.FAILED_FACE_MATCH_SENTINEL_SCORE, status: PhotoVerificationStatus.PENDING };
        }

        // 1. calculate L2 norm (Euclidean distance)
        let sum = 0;
        for (let i = 0; i < baseline.length; i++) {
            sum += Math.pow(baseline[i] - newEmbedding[i], 2);
        }

        const distance = Math.sqrt(sum);

        // 2. Enforce strict business policy threshold
        let status: PhotoVerificationStatus = PhotoVerificationStatus.PENDING;

        // Auto-approve ONLY if it's a tight biometric match AND high visual quality
        if (distance <= KYC_POLICY.MAX_FACE_MATCH_AUTO_APPROVE_DISTANCE) {
            status = PhotoVerificationStatus.APPROVED;
        }

        return { score: distance, status };
    }

    approveManualReview(payload: ApproveManualReviewPayload): void {
        if (this._props.verificationStatus !== VerificationStatus.UNDER_REVIEW) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, USER_ERROR_MESSAGES.KYC_NOT_IN_REVIEWABLE_STATE);
        }

        this._props.verificationStatus = VerificationStatus.APPROVED;
        this._props.reviewDecision = ReviewDecision.MANUAL_APPROVED;
        this._props.adminReviewedBy = payload.adminId;
        this._props.manualReviewRequired = false;
        this._props.approvedAt = new Date();
        this._props.rejectionReason = undefined;
        this._props.updatedAt = new Date();
    }

    rejectManualReview(payload: RejectManualReviewPayload): void {
        if (this._props.verificationStatus !== VerificationStatus.UNDER_REVIEW) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, USER_ERROR_MESSAGES.KYC_NOT_IN_REVIEWABLE_STATE);
        }

        if (!payload.rejectionReason || payload.rejectionReason.trim().length === 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, USER_ERROR_MESSAGES.REJECTION_REASON_REQUIRED);
        }

        this._props.verificationStatus = VerificationStatus.REJECTED;
        this._props.reviewDecision = ReviewDecision.MANUAL_REJECTED;
        this._props.adminReviewedBy = payload.adminId;
        this._props.manualReviewRequired = false;
        this._props.rejectionReason = payload.rejectionReason;
        this._props.rejectedAt = new Date();
        this._props.updatedAt = new Date();
    }

    requestResubmission(payload: RequestResubmissionPayload): void {
        if (this._props.verificationStatus !== VerificationStatus.UNDER_REVIEW) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, USER_ERROR_MESSAGES.KYC_NOT_IN_REVIEWABLE_STATE);
        }

        if (!payload.reasons || payload.reasons.length === 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, USER_ERROR_MESSAGES.RESUBMISSION_REASON_REQUIRED);
        }

        this._props.verificationStatus = VerificationStatus.RESUBMISSION_REQUESTED;
        this._props.reviewDecision = ReviewDecision.RESUBMISSION_REQUESTED;
        this._props.adminReviewedBy = payload.adminId;
        this._props.manualReviewRequired = false;
        this._props.resubmissionReasons = [...payload.reasons];
        this._props.resubmissionMessage = payload.message?.trim() || undefined;
        this._props.resubmissionRequestedAt = new Date();
        this._props.updatedAt = new Date();
    }

    public resetForResubmission(): void {
        if (this._props.verificationStatus !== VerificationStatus.RESUBMISSION_REQUESTED) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, USER_ERROR_MESSAGES.CANNOT_RESET_UNREQUESTED_KYC);
        }

        const reasons = this._props.resubmissionReasons || [];
        const hasDocIssue = reasons.some(
            r => r === KycResubmissionReason.UPLOAD_CORRECT_DOCUMENT || r === KycResubmissionReason.COUNTRY_SELECTION_CORRECTION
        );
        const hasBiometricIssue = reasons.some(
            r => r === KycResubmissionReason.RETAKE_SELFIE || r === KycResubmissionReason.RETRY_LIVENESS_VERIFICATION
        );
        const isGeneralIssue = reasons.includes(KycResubmissionReason.OTHER) || (!hasDocIssue && !hasBiometricIssue);

        // Increment attempt counter and release submission lock
        this._props.verificationSubmitted = false;
        this._props.manualReviewRequired = false;
        this._props.reviewDecision = undefined;
        this._props.verificationAttempt = (this._props.verificationAttempt ?? 1) + 1;

        // PILLAR 1 RESET: If document is flagged or general reset
        if (hasDocIssue || isGeneralIssue) {
            this._props.documentType = undefined;
            this._props.issuingCountry = undefined;
            this._props.legalName = undefined;
            this._props.verifiedDOB = undefined;
            this._props.hashedDocumentNumber = undefined;
        }

        // PILLAR 2 RESET: If selfie/liveness is flagged or general reset
        if (hasBiometricIssue || isGeneralIssue) {
            this._props.liveSelfieS3 = undefined;
            this._props.selfieFaceEmbedding = undefined;
            this._props.selfieVerificationStatus = SelfieVerificationStatus.NOT_STARTED;
            this._props.selfieConfidence = undefined;
            this._props.livenessResults = [];
        }

        // Status calculation
        if (!this.hasValidDocument()) {
            this._props.verificationStatus = VerificationStatus.NOT_STARTED;
        } else {
            // Document is already verified; awaiting biometrics
            this._props.verificationStatus = VerificationStatus.APPROVED;
        }

        this._props.updatedAt = new Date();
    }

    toJSON(): UserKycSnapshot {
        return { ...this._props };
    }
}