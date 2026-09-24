export const AdminRole = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    ADMIN: 'ADMIN',
} as const;

export type AdminRole = typeof AdminRole[keyof typeof AdminRole];

export const AdminStatus = {
    INVITED: 'INVITED',
    ACTIVE: 'ACTIVE',
    SUSPENDED: 'SUSPENDED',
    DEACTIVATED: 'DEACTIVATED',
} as const;

export type AdminStatus = typeof AdminStatus[keyof typeof AdminStatus];

export const AdminSuspensionUnit = {
    HOURS: 'HOURS',
    DAYS: 'DAYS',
} as const;

export type AdminSuspensionUnit = typeof AdminSuspensionUnit[keyof typeof AdminSuspensionUnit];