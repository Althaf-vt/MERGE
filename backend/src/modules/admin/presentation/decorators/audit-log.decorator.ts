import { SetMetadata } from '@nestjs/common';
import { AdminAuditAction, AdminAuditResourceType } from '../../domain/enums/admin-audit.enums';

export const AUDIT_LOG_METADATA_KEY = 'ADMIN_AUDIT_LOG_METADATA';

export interface AuditLogMetadataOptions {
    action: AdminAuditAction | ((req: any, res: any) => AdminAuditAction);
    resourceType: AdminAuditResourceType;
    extractResourceId: (req: any, res: any) => string;
    extractDetails?: (req: any, res: any) => Record<string, unknown> | undefined;
}

export const AuditLog = (options: AuditLogMetadataOptions) =>
    SetMetadata(AUDIT_LOG_METADATA_KEY, options);
