import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { ITokenservice, TOKEN_SERVICE } from '../../../domain/interfaces/token-service.interface';
import { DomainException } from '../../../domain/exceptions/domain.exception';
import { ErrorCode } from '../../../domain/enums/error-code.enum';
import { SHARED_ERROR_MESSAGES } from '../../../domain/constants/shared-error-messages.constant';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        @Inject(TOKEN_SERVICE) private readonly _tokenService: ITokenservice
    ) {}

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new DomainException(ErrorCode.UNAUTHORIZED, SHARED_ERROR_MESSAGES.MISSING_OR_INVALID_AUTH_HEADER);
        }

        const token = authHeader.split(' ')[1];
        
        const payload = this._tokenService.verifyAccessToken(token);
        if (!payload) {
            throw new DomainException(ErrorCode.UNAUTHORIZED, SHARED_ERROR_MESSAGES.INVALID_OR_EXPIRED_ACCESS_TOKEN);
        }

        request.user = payload;
        return true;
    }
}