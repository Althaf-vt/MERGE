export { AdminRole } from "../../../../shared/domain/enums/admin-rbac.enums";

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