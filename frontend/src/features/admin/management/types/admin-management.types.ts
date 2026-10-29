import type { ApiResponse } from '../../../../shared/types/api-response.types';

export {
    ADMIN_ROLES,
    ADMIN_PERMISSIONS,
    type AdminRole,
    type AdminPermission,
} from '../../../../shared/admin/constants/admin-rbac.constants';

import type { AdminRole, AdminPermission } from '../../../../shared/admin/constants/admin-rbac.constants';

export interface InviteAdminRequest {
    email: string;
    fullName: string;
    role: AdminRole;
    permissions: AdminPermission[];
}

export interface AcceptAdminInviteRequest {
    token: string;
    password: string;
    confirmPassword: string;
}

export interface UpdateAdminRequest {
    role?: AdminRole;
    permissions?: AdminPermission[];
}

export type AdminManagementResponse = ApiResponse<undefined>;

export type AdminStatus = 'INVITED' | 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';

export interface AdminStatusLog {
    status: AdminStatus;
    reason: string;
    actionBy: string;
    timestamp: string;
}

export interface AdminDetails {
    id: string;
    email: string;
    fullName: string;
    role: AdminRole;
    status: AdminStatus;
    permissions: AdminPermission[];
    profilePhotoUrl: string | null;
    inviteExpiresAt: string | null;
    lastLoginAt: string | null;
    statusHistory: AdminStatusLog[];
    createdAt: string;
}

export interface GetAdminsRequest {
    page?: number;
    limit?: number;
    role?: AdminRole | '';
    status?: AdminStatus | '';
    search?: string;
}

export type GetAdminsResponse = ApiResponse<AdminDetails[]>;

export interface SuspendAdminRequest {
    adminId: string;
    duration: number;
    unit: 'HOURS' | 'DAYS';
    reason: string;
}

export interface AdminStatusReasonRequest {
    adminId: string;
    reason: string;
}

export type GetAdminDetailsResponse = ApiResponse<AdminDetails>;