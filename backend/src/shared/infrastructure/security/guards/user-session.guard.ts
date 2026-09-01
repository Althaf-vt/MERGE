import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { IUserSessionService, USER_SESSION_SERVICE } from '../../../domain/interfaces/user-session.interface';
import { ErrorCode } from '../../../domain/enums/error-code.enum';
import { DomainException } from '../../../domain/exceptions/domain.exception';


interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        sessionId: string;
        [key: string]: any;
    };
}

@Injectable()
export class UserSessionGuard implements CanActivate {
    constructor(
        @Inject(USER_SESSION_SERVICE) private readonly _sessionService: IUserSessionService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
        
        // Extracted from the request object, which is populated upstream by the JwtAuthGuard
        const userId = request.user?.userId;
        const sessionId = request.user?.sessionId;

        if (!userId || !sessionId) {
            throw new DomainException(ErrorCode.UNAUTHORIZED, 'Authentication context or session missing.');
        }

        // Real-time authoritative lookup against Redis state
        const hasSession = await this._sessionService.validateSession(userId, sessionId);
        if (!hasSession) {
            throw new DomainException(ErrorCode.UNAUTHORIZED, 'Session has expired or was forcefully terminated.');
        }

        return true;
    }
}