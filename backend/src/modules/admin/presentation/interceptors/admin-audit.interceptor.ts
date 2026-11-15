import { CallHandler, ExecutionContext, Inject, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthenticatedRequest } from '../../../../shared/infrastructure/security/interfaces/authenticated-request.interface';
import { ApiResponse } from '../../../../shared/presentation/interfaces/api-response.interface';
import { IRecordAdminAuditLogUseCase, RECORD_ADMIN_AUDIT_LOG_USE_CASE } from '../../application/interfaces/admin-audit.use-cases.interface';
import { AUDIT_LOG_METADATA_KEY, AuditLogMetadataOptions } from '../decorators/audit-log.decorator';

@Injectable()
export class AdminAuditInterceptor implements NestInterceptor {
    private readonly _logger = new Logger(AdminAuditInterceptor.name);

    constructor(
        private readonly _reflector: Reflector,
        @Inject(RECORD_ADMIN_AUDIT_LOG_USE_CASE) private readonly _recordAdminAuditLogUseCase: IRecordAdminAuditLogUseCase,
    ) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        const metadata = this._reflector.get<AuditLogMetadataOptions<Record<string, unknown>>>(
            AUDIT_LOG_METADATA_KEY,
            context.getHandler(),
        );

        if (!metadata) {
            return next.handle();
        }

        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

        return next.handle().pipe(
            tap({
                next: async (response: unknown) => {
                    try {
                        const adminId = request.user?.userId;
                        if (!adminId) {
                            return;
                        }

                        const typedResponse = (response ?? {}) as ApiResponse<Record<string, unknown>>;

                        const action =
                            typeof metadata.action === 'function'
                                ? metadata.action(request, typedResponse)
                                : metadata.action;

                        const resourceId = metadata.extractResourceId(request, typedResponse);
                        if (!resourceId) {
                            return;
                        }

                        const details = metadata.extractDetails
                            ? metadata.extractDetails(request, typedResponse)
                            : undefined;

                        const ipAddress =
                            (request.headers['x-forwarded-for'] as string) ||
                            request.socket?.remoteAddress ||
                            request.ip ||
                            undefined;

                        const userAgent =
                            (request.headers['user-agent'] as string) || undefined;

                        await this._recordAdminAuditLogUseCase.execute({
                            adminId,
                            adminEmail: request.user.email,
                            adminName: undefined,
                            action,
                            resourceType: metadata.resourceType,
                            resourceId,
                            details,
                            ipAddress,
                            userAgent,
                        });
                    } catch (error) {
                        this._logger.error(
                            `Failed to record admin audit log: ${error instanceof Error ? error.message : error}`,
                            error instanceof Error ? error.stack : undefined,
                        );
                    }
                },
            }),
        );
    }
}
