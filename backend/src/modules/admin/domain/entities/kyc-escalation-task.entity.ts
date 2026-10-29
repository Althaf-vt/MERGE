import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { AggregateRoot } from "../../../../shared/domain/events/aggregate-root";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ClaimStatus } from "../enums/claim-status.enum";
import { KycResubmissionReason } from "../enums/kyc-resubmission-reason.enum";
import { KycTaskStatus } from "../enums/kyc-task-status.enum";
import { 
    KycEscalationApprovedDomainEvent, 
    KycEscalationRejectedDomainEvent, 
    KycEscalationResubmissionRequestedDomainEvent 
} from "../events/kyc-escalation.domain-events";
import { ClaimDetailsVO } from "../value-objects/claim-details.vo";

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

export class KycEscalationTask extends AggregateRoot {
    private _props: Required<KycEscalationTaskProps>;

    constructor(props: KycEscalationTaskProps) {
        super();
        this._props = {
            ...props,
            id: props.id ?? '',
            taskStatus: props.taskStatus ?? KycTaskStatus.PENDING,
            claimDetails: props.claimDetails ?? new ClaimDetailsVO(ClaimStatus.UNCLAIMED),
            rejectionReason: props.rejectionReason ?? undefined,
            resubmissionReasons: props.resubmissionReasons ?? undefined,
            resubmissionMessage: props.resubmissionMessage ?? null,
            resolvedAt: props.resolvedAt ?? null,
            createdAt: props.createdAt ?? new Date(),
            updatedAt: props.updatedAt ?? new Date(),
        } as Required<KycEscalationTaskProps>;
    }

    get id(): string { return this._props.id; }
    get targetUserId(): string { return this._props.targetUserId; }
    get documentType(): string { return this._props.documentType; }
    get issuingCountry(): string { return this._props.issuingCountry; }
    get kycSelfieUrl(): string { return this._props.kycSelfieUrl; }
    get uploadedDocumentUrl(): string { return this._props.uploadedDocumentUrl; }
    get livenessScore(): number { return this._props.livenessScore; }
    get faceMatchScore(): number { return this._props.faceMatchScore; }
    get taskStatus(): KycTaskStatus { return this._props.taskStatus; }
    get claimDetails(): ClaimDetailsVO { return this._props.claimDetails; }
    get rejectionReason(): string | undefined { return this._props.rejectionReason; }
    get resubmissionReasons(): KycResubmissionReason[] | undefined { return this._props.resubmissionReasons; }
    get resubmissionMessage(): string | null { return this._props.resubmissionMessage; }
    get resolvedAt(): Date | null { return this._props.resolvedAt; }
    get createdAt(): Date { return this._props.createdAt; }
    get updatedAt(): Date { return this._props.updatedAt; }

    public claim(adminId: string): void {
        this._props.claimDetails = this._props.claimDetails.claim(adminId);
        this._markUpdatedAt();
    }

    public releaseClaim(adminId: string, isSuperAdmin: boolean): void {
        this._props.claimDetails = this._props.claimDetails.release(adminId, isSuperAdmin);
        this._markUpdatedAt();
    }

    public takeoverClaim(superAdminId: string): void {
        this._props.claimDetails = this._props.claimDetails.takeover(superAdminId);
        this._markUpdatedAt();
    }

    public approve(adminId: string, isSuperAdmin: boolean): void {
        this._props.claimDetails.validateCanAct(adminId, isSuperAdmin);

        this._props.taskStatus = KycTaskStatus.APPROVED;
        this._props.claimDetails = this._props.claimDetails.resolve();
        this._props.resolvedAt = new Date();
        this._markUpdatedAt();

        this.addDomainEvent(new KycEscalationApprovedDomainEvent(this.targetUserId, this.id));
    }

    public reject(adminId: string, isSuperAdmin: boolean, reason: string): void {
        this._props.claimDetails.validateCanAct(adminId, isSuperAdmin);

        if (!reason || reason.trim().length === 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, 'A reason is required when rejecting a KYC escalation.');
        }

        this._props.taskStatus = KycTaskStatus.REJECTED;
        this._props.rejectionReason = reason.trim();
        this._props.claimDetails = this._props.claimDetails.resolve();
        this._props.resolvedAt = new Date();
        this._markUpdatedAt();

        this.addDomainEvent(new KycEscalationRejectedDomainEvent(this.targetUserId, this.id, this._props.rejectionReason));
    }

    public requestResubmission(
        adminId: string, 
        isSuperAdmin: boolean, 
        reasons: KycResubmissionReason[], 
        message?: string
    ): void {
        this._props.claimDetails.validateCanAct(adminId, isSuperAdmin);

        if (!reasons || reasons.length === 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, 'At least one reason is required when requesting KYC resubmission.');
        }

        this._props.taskStatus = KycTaskStatus.RESUBMISSION_REQUESTED;
        this._props.resubmissionReasons = [...reasons];
        this._props.resubmissionMessage = message?.trim() || null;
        this._props.claimDetails = this._props.claimDetails.resolve();
        this._props.resolvedAt = new Date();
        this._markUpdatedAt();

        this.addDomainEvent(
            new KycEscalationResubmissionRequestedDomainEvent(
                this.targetUserId, 
                this.id, 
                this._props.resubmissionReasons, 
                this._props.resubmissionMessage ?? undefined
            )
        );
    }

    private _markUpdatedAt(): void {
        this._props.updatedAt = new Date();
    }

    public toJSON(): Record<string, unknown> {
        return {
            ...this._props,
            claimDetails: this._props.claimDetails.toJSON(),
        };
    }
}