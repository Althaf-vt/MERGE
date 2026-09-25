import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { ADMIN_SESSION_SERVICE, IAdminSessionService } from '../../../domain/interfaces/admin-session.interface';
import { ErrorCode } from '../../../../../shared/domain/enums/error-code.enum';
import { DomainException } from '../../../../../shared/domain/exceptions/domain.exception';

interface AuthenticatedRequest extends Request { user?: any; }

@Injectable()
export class AdminSessionGuard implements CanActivate {
    constructor(
        @Inject(ADMIN_SESSION_SERVICE) private readonly _sessionService: IAdminSessionService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
        const userId = request.user?.userId; // Set by JwtAuthGuard previously

        if (!userId) {
            throw new DomainException(ErrorCode.UNAUTHORIZED, 'Authentication context missing.');
        }

        const hasSession = await this._sessionService.hasValidSession(userId);
        if (!hasSession) {
            throw new DomainException(ErrorCode.UNAUTHORIZED, 'Session has expired or was forcefully terminated.');
        }

        return true;
    }
}