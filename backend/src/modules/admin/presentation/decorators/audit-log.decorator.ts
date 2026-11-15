import { SetMetadata } from '@nestjs/common';
import { AuthenticatedRequest } from '../../../../shared/infrastructure/security/interfaces/authenticated-request.interface';
import { ApiResponse } from '../../../../shared/presentation/interfaces/api-response.interface';
import { AdminAuditAction, AdminAuditResourceType } from '../../domain/enums/admin-audit.enums';

export const AUDIT_LOG_METADATA_KEY = 'ADMIN_AUDIT_LOG_METADATA';

export interface AuditLogMetadataOptions<T = Record<string, unknown>> {
    action: AdminAuditAction | ((req: AuthenticatedRequest, res: ApiResponse<T>) => AdminAuditAction);
    resourceType: AdminAuditResourceType;
    extractResourceId: (req: AuthenticatedRequest, res: ApiResponse<T>) => string | undefined;
    extractDetails?: (req: AuthenticatedRequest, res: ApiResponse<T>) => Record<string, unknown> | undefined;
}

export const AuditLog = <T = Record<string, unknown>>(options: AuditLogMetadataOptions<T>) =>
    SetMetadata(AUDIT_LOG_METADATA_KEY, options);

