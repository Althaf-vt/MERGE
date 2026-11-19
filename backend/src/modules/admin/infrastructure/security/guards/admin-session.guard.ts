import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { ADMIN_SESSION_SERVICE, IAdminSessionService } from '../../../domain/interfaces/admin-session.interface';
import { ErrorCode } from '../../../../../shared/domain/enums/error-code.enum';
import { DomainException } from '../../../../../shared/domain/exceptions/domain.exception';
import { AuthenticatedRequest } from '../../../../../shared/infrastructure/security/interfaces/authenticated-request.interface';
import { ADMIN_ERROR_MESSAGES } from '../../../domain/constants/admin-error-messages.constant';

@Injectable()
export class AdminSessionGuard implements CanActivate {
    constructor(
        @Inject(ADMIN_SESSION_SERVICE) private readonly _sessionService: IAdminSessionService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
        const userId = request.user?.userId; // Set by JwtAuthGuard previously

        if (!userId) {
            throw new DomainException(ErrorCode.UNAUTHORIZED, ADMIN_ERROR_MESSAGES.AUTH_CONTEXT_MISSING);
        }

        const hasSession = await this._sessionService.hasValidSession(userId);
        if (!hasSession) {
            throw new DomainException(ErrorCode.UNAUTHORIZED, ADMIN_ERROR_MESSAGES.SESSION_EXPIRED_OR_TERMINATED);
        }

        return true;
    }
}