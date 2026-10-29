export const ADMIN_ROLES = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    ADMIN: 'ADMIN',
} as const;

export type AdminRole = (typeof ADMIN_ROLES)[keyof typeof ADMIN_ROLES];

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

export type AdminPermission = (typeof ADMIN_PERMISSIONS)[keyof typeof ADMIN_PERMISSIONS];