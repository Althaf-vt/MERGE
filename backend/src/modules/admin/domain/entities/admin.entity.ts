import { ErrorCode } from "../../../users/domain/enums/error-code.enum";
import { DomainException } from "../../../users/domain/exceptions/domain.exception";
import { EmailVO } from "../../../users/domain/value-objects/email.vo";
import { AdminPermission } from "../enums/admin-permission.enums";
import { AdminRole, AdminStatus } from "../enums/admin.enums";

export interface AdminAggregateProps {
    id?: string;
    email: EmailVO;
    passwordHash: string;
    role: AdminRole;
    fullName: string;
    profilePhotoUrl?: string;
    status: AdminStatus;
    permissions: AdminPermission[];
    lastLoginAt?: Date;
    createdBy?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export class AdminAggregate {
    private _props: AdminAggregateProps;

    constructor(props: AdminAggregateProps) {
        this._props = {
            ...props,
            role: props.role ?? AdminRole.ADMIN,
            status: props.status ?? AdminStatus.ACTIVE,
            permissions: props.permissions ?? [],
            createdAt: props.createdAt ?? new Date(),
            updatedAt: props.updatedAt ?? new Date(),
        };
    }

    get id(): string | undefined { return this._props.id; }
    get email(): EmailVO { return this._props.email; }
    get passwordHash(): string { return this._props.passwordHash; }
    get role(): AdminRole { return this._props.role; }
    get fullName(): string { return this._props.fullName; }
    get profilePhotoUrl(): string | undefined { return this._props.profilePhotoUrl; }
    get status(): AdminStatus { return this._props.status; }
    get permissions(): AdminPermission[] { return this._props.permissions; }
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

    suspend(): void {
        this._props.status = AdminStatus.SUSPENDED;
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

    private _markUpdatedAt(): void {
        this._props.updatedAt = new Date();
    }

    toJSON() {
        return {
            ...this._props,
            email: this._props.email.getValue(), // unwrap the value object
            permissions: this.permissions,
        };
    }
}