export type AdminRole = 'SUPER_ADMIN' | 'ADMIN';

export const ADMIN_PERMISSIONS = {
    KYC_VIEW: 'kyc:view',
    KYC_APPROVE: 'kyc:approve',
    KYC_REJECT: 'kyc:reject',
    USERS_VIEW: 'users:view',
    USERS_SUSPEND: 'users:suspend',
    USERS_BAN: 'users:ban',
    USERS_FORCE_LOGOUT: 'users:force_logout',
    ADMINS_VIEW: 'admins:view',
    ADMINS_INVITE: 'admins:invite',
    ADMINS_SUSPEND: 'admins:suspend',
    ADMINS_ASSIGN_PERMISSIONS: 'admins:assign_permissions',
    SCENE_PARTNER_MANAGE: 'scene_partner:manage',
    LUMEN_MANAGE: 'lumen:manage',
    SETTINGS_VIEW: 'settings:view',
    SETTINGS_EDIT: 'settings:edit',
    BILLING_VIEW: 'billing:view',
    BILLING_EDIT: 'billing:edit',
} as const;

export type AdminPermission = typeof ADMIN_PERMISSIONS[keyof typeof ADMIN_PERMISSIONS];

export interface InviteAdminRequest {
    email: string;
    fullName: string;
    role: AdminRole;
    permissions: AdminPermission[];
}

export interface AcceptAdminInviteRequest {
    token: string;
    password: string;
}

export interface UpdateAdminRequest {
    role?: AdminRole;
    permissions?: AdminPermission[];
}

export interface AdminManagementResponse {
    success: boolean;
    message: string;
}

export type AdminStatus = 'INVITED' | 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';

export interface AdminDetails {
    id: string;
    email: string;
    fullName: string;
    role: AdminRole;
    status: AdminStatus;
    permissions: AdminPermission[];
    profilePhotoUrl: string | null;
    lastLoginAt: string | null;
    createdAt: string;
}

export interface GetAdminsRequest {
    page?: number;
    limit?: number;
    role?: AdminRole | '';
    status?: AdminStatus | '';
    search?: string;
}

export interface GetAdminsResponse {
    success: boolean;
    data: AdminDetails[];
    meta: {
        total: number;
        page: number;
        limit: number;
    };
}

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