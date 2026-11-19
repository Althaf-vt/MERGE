import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { AggregateRoot } from "../../../../shared/domain/events/aggregate-root";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { EmailVO } from "../../../../shared/domain/value-objects/email.vo";
import { AdminPermission, AdminRole } from "../../../../shared/domain/enums/admin-rbac.enums";
import { AdminStatus } from "../enums/admin.enums";
import { AdminSuspensionDurationVO } from "../value-objects/admin-suspension-duration.vo";
import { AdminAggregateProps, AdminSnapshot, AdminStatusLog, InternalAdminProps } from "../interfaces/admin.types";
import { ADMIN_ERROR_MESSAGES } from "../constants/admin-error-messages.constant";

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

        // Super Admin bypass permission checks
        if (this._props.role === AdminRole.SUPER_ADMIN) {
            return true;
        }

        return this._props.permissions.includes(permission);
    }

    // Encapsulate Behaviors
    recordLogin(): void {
        if (this._props.status !== AdminStatus.ACTIVE) {
            throw new DomainException(ErrorCode.INVALID_CREDENTIALS, ADMIN_ERROR_MESSAGES.INACTIVE_ACCOUNT_LOGIN);
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
            throw new DomainException(ErrorCode.VALIDATION_FAILED, ADMIN_ERROR_MESSAGES.CANNOT_SUSPEND_DEACTIVATED);
        }
        if (this._props.role === AdminRole.SUPER_ADMIN) {
            throw new DomainException(ErrorCode.FORBIDDEN, ADMIN_ERROR_MESSAGES.CANNOT_SUSPEND_SUPER_ADMIN);
        }
        this._props.status = AdminStatus.SUSPENDED;
        this._props.suspendedUntil = durationVO.getExpiresAt();
        this._recordStatusLog(AdminStatus.SUSPENDED, reason, actionBy);
        this._markUpdatedAt();
    }

    deactivateAccount(reason: string, actionBy: string): void {
        if (this._props.role === AdminRole.SUPER_ADMIN) {
            throw new DomainException(ErrorCode.FORBIDDEN, ADMIN_ERROR_MESSAGES.CANNOT_DEACTIVATE_SUPER_ADMIN);
        }

        this._props.status = AdminStatus.DEACTIVATED;
        this._props.suspendedUntil = null // clear suspension if permanently deactivated
        this._recordStatusLog(AdminStatus.DEACTIVATED, reason, actionBy);
        this._markUpdatedAt();
    }

    reactivateAccount(reason: string, actionBy: string): void {
        if (this._props.status === AdminStatus.ACTIVE) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, ADMIN_ERROR_MESSAGES.ACCOUNT_ALREADY_ACTIVE);
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
            this._props.permissions = Array.from(new Set(newPermissions));
        }

        this._markUpdatedAt();
    }

    changeRole(newRole: AdminRole): void {
        if (this._props.status === AdminStatus.DEACTIVATED) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, ADMIN_ERROR_MESSAGES.CANNOT_CHANGE_ROLE_DEACTIVATED);
        }
        this._props.role = newRole;
        this._markUpdatedAt();
    }

    acceptInvitation(newPasswordHash: string): void {
        if (this._props.status !== AdminStatus.INVITED) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, ADMIN_ERROR_MESSAGES.NOT_PENDING_INVITATION);
        }
        this._props.passwordHash = newPasswordHash;
        this._props.status = AdminStatus.ACTIVE;
        this._props.inviteExpiresAt = null; // clear on success
        this._markUpdatedAt();
    }

    renewInvitation(newExpiryDate: Date): void {
        if (this._props.status !== AdminStatus.INVITED) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, ADMIN_ERROR_MESSAGES.ONLY_PENDING_INVITATIONS_RENEWED);
        }

        if (this._props.inviteExpiresAt && this._props.inviteExpiresAt.getTime() > new Date().getTime()) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, ADMIN_ERROR_MESSAGES.INVITATION_STILL_ACTIVE);
        }
        
        this._props.inviteExpiresAt = newExpiryDate;
        this._markUpdatedAt();
    }

    validateCanCancelInvitation(): void {
        if (this._props.status !== AdminStatus.INVITED) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, ADMIN_ERROR_MESSAGES.ONLY_PENDING_INVITATIONS_CANCELLED);
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

    toJSON(): AdminSnapshot {
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