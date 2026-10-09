import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ClaimStatus } from "../enums/claim-status.enum";

export class ClaimDetailsVO {
    private readonly _status: ClaimStatus;
    private readonly _claimedBy: string | null;
    private readonly _claimedAt: Date | null;

    constructor(status: ClaimStatus, claimedBy: string | null = null, claimedAt: Date | null = null) {
        this._status = status;
        this._claimedBy = claimedBy;
        this._claimedAt = claimedAt;
    }

    get status(): ClaimStatus { return this._status; }
    get claimedBy(): string | null { return this._claimedBy; }
    get claimedAt(): Date | null { return this._claimedAt; }

    // Enforce the single-writer, multi-reader lock
    validateCanAct(adminId: string, isSuperAdmin: boolean): void {
        if (isSuperAdmin) return; // Super admins bypass claim ownership rules

        if (this._status === ClaimStatus.UNCLAIMED) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, 'Task must be claimed before taking action.');
        }

        if (this._status === ClaimStatus.RESOLVED) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, 'Task is already resolved and immutable.');
        }

        if (!isSuperAdmin && this._claimedBy !== adminId) {
            throw new DomainException(ErrorCode.FORBIDDEN, 'Task is currently claimed by another administrator.');
        }
    }

    claim(adminId: string): ClaimDetailsVO {
        if (this._status === ClaimStatus.RESOLVED) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, 'Cannot claim a resolved task.');
        }

        if (this._status === ClaimStatus.CLAIMED) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, 'Task is already claimed.');
        }

        return new ClaimDetailsVO(ClaimStatus.CLAIMED, adminId, new Date())
    }

    public release(adminId: string, isSuperAdmin: boolean): ClaimDetailsVO {
        if (this._status !== ClaimStatus.CLAIMED) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, 'Task is not currently claimed.');
        }
        if (this._claimedBy !== adminId && !isSuperAdmin) {
            throw new DomainException(ErrorCode.FORBIDDEN, 'Only the claim owner or a Super Admin can release this claim.');
        }
        return new ClaimDetailsVO(ClaimStatus.UNCLAIMED, null, null);
    }

    public takeover(superAdminId: string): ClaimDetailsVO {
        if (this._status === ClaimStatus.RESOLVED) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, 'Cannot takeover a resolved task.');
        }
        // Directly assigns ownership to the Super Admin, overriding any existing claim
        return new ClaimDetailsVO(ClaimStatus.CLAIMED, superAdminId, new Date());
    }

    public resolve(): ClaimDetailsVO {
        // Locks the VO permanently once the moderation action is completed
        return new ClaimDetailsVO(ClaimStatus.RESOLVED, this._claimedBy, this._claimedAt);
    }

    public toJSON() {
        return {
            status: this._status,
            claimedBy: this._claimedBy,
            claimedAt: this._claimedAt,
        };
    }
}