import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { ITokenservice, TOKEN_SERVICE } from '../../../domain/interfaces/token-service.interface';
import { DomainException } from '../../../domain/exceptions/domain.exception';
import { ErrorCode } from '../../../domain/enums/error-code.enum';
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
            throw new DomainException(ErrorCode.UNAUTHORIZED, 'Missing or invalid authorization header.');
        }

        const token = authHeader.split(' ')[1];
        
        try {
            const payload = this._tokenService.verifyAccessToken(token);
            request.user = payload;
            return true;
        } catch (error: unknown) {
            throw new DomainException(ErrorCode.UNAUTHORIZED, 'Invalid or expired access token.');
        }
    }
}