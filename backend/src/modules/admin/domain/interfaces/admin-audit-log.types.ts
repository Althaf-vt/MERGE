import { AdminAuditAction, AdminAuditResourceType } from '../enums/admin-audit.enums';

export interface CreateAdminAuditLogProps {
    id?: string;
    adminId: string;
    adminEmail?: string;
    adminName?: string;
    action: AdminAuditAction;
    resourceType: AdminAuditResourceType;
    resourceId: string;
    details?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
    createdAt?: Date;
}

export interface AdminAuditLogProps {
    id?: string;
    adminId: string;
    adminEmail?: string;
    adminName?: string;
    action: AdminAuditAction;
    resourceType: AdminAuditResourceType;
    resourceId: string;
    details?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
    createdAt?: Date;
}

export interface AdminAuditLogData {
    id?: string;
    adminId: string;
    adminEmail?: string;
    adminName?: string;
    action: AdminAuditAction;
    resourceType: AdminAuditResourceType;
    resourceId: string;
    details?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
}

export interface AdminAuditLogSnapshot {
    id?: string;
    adminId: string;
    adminEmail?: string;
    adminName?: string;
    action: AdminAuditAction;
    resourceType: AdminAuditResourceType;
    resourceId: string;
    details?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
}
