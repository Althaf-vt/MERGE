import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { AggregateRoot } from "../../../../shared/domain/events/aggregate-root";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ClaimStatus } from "../enums/claim-status.enum";
import { PhotoTaskStatus } from "../enums/photo-task-status.enum";
import { PhotoApprovedDomainEvent } from "../events/photo-approved.domain-event";
import { PhotoRejectedDomainEvent } from "../events/photo-rejected.domain-event";
import { ClaimDetailsVO } from "../value-objects/claim-details.vo";

export interface PhotoVerificationTaskProps {
    id?: string;
    targetUserId: string;
    photoId: string;
    kycSelfieUrl: string; // The Golden Identity baseline
    uploadedPhotoUrl: string; // The low-confidence photo under review
    faceMatchScore: number;
    taskStatus?: PhotoTaskStatus;
    claimDetails?: ClaimDetailsVO;
    rejectionReason?: string;
    resolvedAt?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export class PhotoVerificationTask extends AggregateRoot {
    private _props: Required<PhotoVerificationTaskProps>;

    constructor(props: PhotoVerificationTaskProps) {
        super();
        this._props = {
            ...props,
            id: props.id ?? '',
            taskStatus: props.taskStatus ?? PhotoTaskStatus.PENDING,
            claimDetails: props.claimDetails ?? new ClaimDetailsVO(ClaimStatus.UNCLAIMED),
            rejectionReason: props.rejectionReason ?? undefined,
            resolvedAt: props.resolvedAt ?? null,
            createdAt: props.createdAt ?? new Date(),
            updatedAt: props.updatedAt ?? new Date(),
        } as Required<PhotoVerificationTaskProps>;
    }

    get id(): string { return this._props.id; }
    get targetUserId(): string { return this._props.targetUserId; }
    get photoId(): string { return this._props.photoId; }
    get kycSelfieUrl(): string { return this._props.kycSelfieUrl; }
    get uploadedPhotoUrl(): string { return this._props.uploadedPhotoUrl; }
    get faceMatchScore(): number { return this._props.faceMatchScore; }
    get taskStatus(): PhotoTaskStatus { return this._props.taskStatus; }
    get claimDetails(): ClaimDetailsVO { return this._props.claimDetails; }
    get rejectionReason(): string | undefined { return this._props.rejectionReason; }
    get resolvedAt(): Date | null { return this._props.resolvedAt; }
    get createdAt(): Date { return this._props.createdAt; }
    get updatedAt(): Date { return this._props.updatedAt; }

    claim(adminId: string): void {
        this._props.claimDetails = this._props.claimDetails.claim(adminId);
        this._markUpdatedAt();
    }

    releaseClaim(adminId: string, isSuperAdmin: boolean): void {
        this._props.claimDetails = this._props.claimDetails.release(adminId, isSuperAdmin);
        this._markUpdatedAt();
    }

    takeoverClaim(superAdminId: string): void {
        this._props.claimDetails = this._props.claimDetails.takeover(superAdminId);
        this._markUpdatedAt();
    }

    approve(adminId: string, isSuperAdmin: boolean): void {
        this._props.claimDetails.validateCanAct(adminId, isSuperAdmin);

        this._props.taskStatus = PhotoTaskStatus.APPROVED;
        this._props.claimDetails = this._props.claimDetails.resolve();
        this._props.resolvedAt = new Date();
        this._markUpdatedAt();

        // Dispatch EDA event for the User module to finalize the photo status
        this.addDomainEvent(new PhotoApprovedDomainEvent(this.targetUserId, this.photoId));
    }

    public reject(adminId: string, isSuperAdmin: boolean, reason: string): void {
        this._props.claimDetails.validateCanAct(adminId, isSuperAdmin);

        if (!reason || reason.trim().length === 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, 'A reason is required when rejecting a profile photo.');
        }

        this._props.taskStatus = PhotoTaskStatus.REJECTED;
        this._props.rejectionReason = reason.trim();
        this._props.claimDetails = this._props.claimDetails.resolve();
        this._props.resolvedAt = new Date();
        this._markUpdatedAt();

        // Dispatch EDA event for the User module to flag or remove the photo
        this.addDomainEvent(new PhotoRejectedDomainEvent(this.targetUserId, this.photoId, this._props.rejectionReason));
    }

    private _markUpdatedAt(): void {
        this._props.updatedAt = new Date();
    }

    toJSON() {
        return {
            ...this._props,
            claimDetails: this._props.claimDetails.toJSON(),
        };
    }
}