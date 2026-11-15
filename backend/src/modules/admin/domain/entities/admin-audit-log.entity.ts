import { ErrorCode } from '../../../../shared/domain/enums/error-code.enum';
import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';
import { AdminAuditAction, AdminAuditResourceType } from '../enums/admin-audit.enums';
import {AdminAuditLogData,AdminAuditLogProps,AdminAuditLogSnapshot,CreateAdminAuditLogProps} from '../interfaces/admin-audit-log.types';

export class AdminAuditLog {
    private readonly _props: AdminAuditLogProps;

    constructor(props: AdminAuditLogProps) {
        this._validateInvariants(props);

        this._props = {
            id: props.id?.trim() || undefined,
            adminId: props.adminId.trim(),
            adminEmail: props.adminEmail?.trim() || undefined,
            adminName: props.adminName?.trim() || undefined,
            action: props.action,
            resourceType: props.resourceType,
            resourceId: props.resourceId.trim(),
            details: props.details ? { ...props.details } : undefined,
            ipAddress: props.ipAddress?.trim() || undefined,
            userAgent: props.userAgent?.trim() || undefined,
            createdAt: props.createdAt ?? new Date(),
        };
    }

    private _validateInvariants(props: AdminAuditLogProps): void {
        if (!props.adminId || typeof props.adminId !== 'string' || props.adminId.trim().length === 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, 'Admin ID is required to create an audit log.');
        }

        if (!props.action || !Object.values(AdminAuditAction).includes(props.action)) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, `Invalid audit action: ${props.action}`);
        }

        if (!props.resourceType || !Object.values(AdminAuditResourceType).includes(props.resourceType)) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, `Invalid audit resource type: ${props.resourceType}`);
        }

        if (!props.resourceId || typeof props.resourceId !== 'string' || props.resourceId.trim().length === 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, 'Resource ID is required to create an audit log.');
        }
    }

    public static create(props: CreateAdminAuditLogProps): AdminAuditLog {
        return new AdminAuditLog(props);
    }

    public static restore(snapshot: AdminAuditLogSnapshot): AdminAuditLog {
        return new AdminAuditLog({
            id: snapshot.id,
            adminId: snapshot.adminId,
            adminEmail: snapshot.adminEmail,
            adminName: snapshot.adminName,
            action: snapshot.action,
            resourceType: snapshot.resourceType,
            resourceId: snapshot.resourceId,
            details: snapshot.details ? { ...snapshot.details } : undefined,
            ipAddress: snapshot.ipAddress,
            userAgent: snapshot.userAgent,
            createdAt: snapshot.createdAt,
        });
    }

    public get id(): string | undefined {
        return this._props.id;
    }

    public get adminId(): string {
        return this._props.adminId;
    }

    public get adminEmail(): string | undefined {
        return this._props.adminEmail;
    }

    public get adminName(): string | undefined {
        return this._props.adminName;
    }

    public get action(): AdminAuditAction {
        return this._props.action;
    }

    public get resourceType(): AdminAuditResourceType {
        return this._props.resourceType;
    }

    public get resourceId(): string {
        return this._props.resourceId;
    }

    public get details(): Record<string, unknown> | undefined {
        return this._props.details ? { ...this._props.details } : undefined;
    }

    public get ipAddress(): string | undefined {
        return this._props.ipAddress;
    }

    public get userAgent(): string | undefined {
        return this._props.userAgent;
    }

    public get createdAt(): Date {
        return this._props.createdAt ?? new Date();
    }

    public toSnapshot(): AdminAuditLogSnapshot {
        return {
            id: this._props.id,
            adminId: this._props.adminId,
            adminEmail: this._props.adminEmail,
            adminName: this._props.adminName,
            action: this._props.action,
            resourceType: this._props.resourceType,
            resourceId: this._props.resourceId,
            details: this._props.details ? { ...this._props.details } : undefined,
            ipAddress: this._props.ipAddress,
            userAgent: this._props.userAgent,
            createdAt: this._props.createdAt ? new Date(this._props.createdAt.getTime()) : new Date(),
        };
    }

    public toData(): AdminAuditLogData {
        return {
            id: this._props.id,
            adminId: this._props.adminId,
            adminEmail: this._props.adminEmail,
            adminName: this._props.adminName,
            action: this._props.action,
            resourceType: this._props.resourceType,
            resourceId: this._props.resourceId,
            details: this._props.details ? { ...this._props.details } : undefined,
            ipAddress: this._props.ipAddress,
            userAgent: this._props.userAgent,
            createdAt: this._props.createdAt ? new Date(this._props.createdAt.getTime()) : new Date(),
        };
    }
}
