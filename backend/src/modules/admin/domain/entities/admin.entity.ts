import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { AggregateRoot } from "../../../../shared/domain/events/aggregate-root";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { EmailVO } from "../../../../shared/domain/value-objects/email.vo";
import { AdminPermission } from "../enums/admin-permission.enums";
import { AdminRole, AdminStatus } from "../enums/admin.enums";
import { AdminSuspensionDurationVO } from "../value-objects/admin-suspension-duration.vo";


export interface AdminStatusLog {
    status: AdminStatus;
    reason: string;
    actionBy: string;
    timestamp: Date;
}

export interface AdminAggregateProps {
    id?: string;
    email: EmailVO;
    passwordHash?: string | null;
    role: AdminRole;
    fullName: string;
    profilePhotoUrl?: string;
    status: AdminStatus;
    suspendedUntil?: Date | null;
    statusHistory?: AdminStatusLog[];
    permissions: AdminPermission[];
    inviteExpiresAt?: Date | null;
    lastLoginAt?: Date;
    createdBy?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

interface InternalAdminProps extends AdminAggregateProps {
    statusHistory: AdminStatusLog[];
    permissions: AdminPermission[];
}

export class AdminAggregate extends AggregateRoot {
    private _props: InternalAdminProps;

    constructor(props: AdminAggregateProps) {
        super();
        this._props = {
            ...props,
            role: props.role ?? AdminRole.ADMIN,
            status: props.status ?? AdminStatus.ACTIVE,
            suspendedUntil: props.suspendedUntil ?? null,
            statusHistory: props.statusHistory ?? [],
            permissions: props.permissions ?? [],
            createdAt: props.createdAt ?? new Date(),
            updatedAt: props.updatedAt ?? new Date(),
        };
    }

    get id(): string | undefined { return this._props.id; }
    get email(): EmailVO { return this._props.email; }
    get passwordHash(): string | null | undefined { return this._props.passwordHash; }
    get role(): AdminRole { return this._props.role; }
    get fullName(): string { return this._props.fullName; }
    get profilePhotoUrl(): string | undefined { return this._props.profilePhotoUrl; }
    get status(): AdminStatus { return this._props.status; }
    get suspendedUntil(): Date | null | undefined { return this._props.suspendedUntil; }
    get statusHistory(): AdminStatusLog[] { return [...this._props.statusHistory]; }
    get permissions(): AdminPermission[] { return this._props.permissions; }
    get inviteExpiresAt(): Date | null | undefined { return this._props.inviteExpiresAt; }
    get lastLogin(): Date | undefined { return this._props.lastLoginAt; }
    get createdBy(): string | undefined { return this._props.createdBy; }
    get createdAt(): Date | undefined { return this._props.createdAt; }
    get updatedAt(): Date | undefined { return this._props.updatedAt; }

    // Domain Invariant: Core capability Authorization
    hasPermission(permission: AdminPermission): boolean {
        if (this._props.status !== AdminStatus.ACTIVE) {
            return false;
        }

        // Super Admin bypass persmission checks
        if (this._props.role === AdminRole.SUPER_ADMIN) {
            return true;
        }

        return this._props.permissions.includes(permission);
    }

    // Encapsulate Behaviors
    recordLogin(): void {
        if (this._props.status !== AdminStatus.ACTIVE) {
            throw new DomainException(ErrorCode.INVALID_CREDENTIALS, "Inactive admin account cannot login.");
        }
        this._props.lastLoginAt = new Date();
        this._markUpdatedAt();
    }

    updatePassword(newPasswordHash: string): void {
        this._props.passwordHash = newPasswordHash;
        this._markUpdatedAt();
    }

    suspendAccount(durationVO: AdminSuspensionDurationVO, reason: string, actionBy: string): void {
        if (this._props.status === AdminStatus.DEACTIVATED) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, 'Cannot suspend a deactivated account.');
        }
        if (this._props.role === AdminRole.SUPER_ADMIN) {
            throw new DomainException(ErrorCode.FORBIDDEN, 'Super Admins cannot be suspended.');
        }
        this._props.status = AdminStatus.SUSPENDED;
        this._props.suspendedUntil = durationVO.getExpiresAt();
        this._recordStatusLog(AdminStatus.SUSPENDED, reason, actionBy);
        this._markUpdatedAt();
    }

    deactivateAccount(reason: string, actionBy: string): void {
        if (this._props.role === AdminRole.SUPER_ADMIN) {
            throw new DomainException(ErrorCode.FORBIDDEN, 'Super Admins cannot be deactivated.');
        }

        this._props.status = AdminStatus.DEACTIVATED;
        this._props.suspendedUntil = null // clear suspension if permanently deactivated
        this._recordStatusLog(AdminStatus.DEACTIVATED, reason, actionBy);
        this._markUpdatedAt();
    }

    reactivateAccount(reason: string, actionBy: string): void {
        if (this._props.status === AdminStatus.ACTIVE) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, 'Account is already active.');
        }

        this._props.status = AdminStatus.ACTIVE;
        this._props.suspendedUntil = null;
        this._recordStatusLog(AdminStatus.ACTIVE, reason, actionBy);
        this._markUpdatedAt();
    }

    assignPermissions(newPermissions: AdminPermission[]): void {
        if (this._props.role === AdminRole.SUPER_ADMIN) {
            this._props.permissions = Object.values(AdminPermission);
        } else {
            // Deduplicate icoming array
            this._props.permissions = Array.from(new Set(newPermissions));
        }

        this._markUpdatedAt();
    }

    changeRole(newRole: AdminRole): void {
        if (this._props.status === AdminStatus.DEACTIVATED) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, 'Cannot change the role of a deactivated admin.');
        }
        this._props.role = newRole;
        this._markUpdatedAt();
    }

    acceptInvitation(newPasswordHash: string): void {
        if (this._props.status !== AdminStatus.INVITED) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, 'This account is not pending an invitation')
        }
        this._props.passwordHash = newPasswordHash;
        this._props.status = AdminStatus.ACTIVE;
        this._props.inviteExpiresAt = null; // clear on success
        this._markUpdatedAt();
    }

    renewInvitation(newExpiryDate: Date): void {
        if (this._props.status !== AdminStatus.INVITED) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, 'Only pending invitations can be renewed.');
        }

        if (this._props.inviteExpiresAt && this._props.inviteExpiresAt.getTime() > new Date().getTime()) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, 'Current invitation is still active. You can only re-invite expired accounts.');
        }
        
        this._props.inviteExpiresAt = newExpiryDate;
        this._markUpdatedAt();
    }

    validateCanCancelInvitation(): void {
        if (this._props.status !== AdminStatus.INVITED) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, 'Only pending invitations can be cancelled. Active or suspended accounts must be deactivated.');
        }
    }

    private _markUpdatedAt(): void {
        this._props.updatedAt = new Date();
    }

    private _recordStatusLog(status: AdminStatus, reason: string, actionBy: string) {
        this._props.statusHistory.push({
            status,
            reason,
            actionBy,
            timestamp: new Date()
        })
    }

    toJSON() {
        return {
            ...this._props,
            email: this._props.email.getValue(),
            permissions: [...this._props.permissions],
            statusHistory: this._props.statusHistory.map((log) => ({
                status: log.status,
                reason: log.reason,
                actionBy: log.actionBy,
                timestamp: log.timestamp,
            })),
        };
    }
}