import { AdminPermission } from "../enums/admin-permission.enums";
import { AdminStatus } from "../enums/admin.enums";
import { AdminRole } from "../../../../shared/domain/enums/admin-rbac.enums";
import { EmailVO } from "../../../../shared/domain/value-objects/email.vo";

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

export interface InternalAdminProps extends AdminAggregateProps {
    statusHistory: AdminStatusLog[];
    permissions: AdminPermission[];
}

export interface AdminSnapshot {
    id?: string;
    email: string;
    passwordHash?: string | null;
    role: AdminRole;
    fullName: string;
    profilePhotoUrl?: string;
    status: AdminStatus;
    suspendedUntil?: Date | null;
    statusHistory: AdminStatusLog[];
    permissions: AdminPermission[];
    inviteExpiresAt?: Date | null;
    lastLoginAt?: Date;
    createdBy?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
