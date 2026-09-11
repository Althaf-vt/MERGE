import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { DomainException } from '../../../modules/users/domain/exceptions/domain.exception';
import { ErrorCode } from '../../../modules/users/domain/enums/error-code.enum';

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
    catch(exception: DomainException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        // Map Business Errors to standard HTTP Status Codes (using NestJS built-in enum)
        const status = this._mapToHttpStatus(exception.code);

        // Standardized Error Response Format
        response.status(status).json({
            success: false,
            error: {
                code: exception.code,
                message: exception.message,
            },
            timestamp: new Date().toISOString(),
        });
    }

    private _mapToHttpStatus(code: ErrorCode): HttpStatus {
        switch (code) {
            case ErrorCode.USER_NOT_FOUND:
                return HttpStatus.NOT_FOUND; // 404
            case ErrorCode.INVALID_CREDENTIALS:
            case ErrorCode.TOKEN_EXPIRED:
            case ErrorCode.TOKEN_INVALID:
                return HttpStatus.UNAUTHORIZED; // 401
            case ErrorCode.EMAIL_NOT_VERIFIED:
            case ErrorCode.OTP_EXPIRED:
            case ErrorCode.OTP_INVALID:
            case ErrorCode.FACE_MISMATCH:
                return HttpStatus.FORBIDDEN; // 403
            case ErrorCode.USER_ALREADY_EXISTS:
                return HttpStatus.CONFLICT; // 409
            case ErrorCode.KYC_DOCUMENT_INVALID:
            case ErrorCode.LIVENESS_CHECK_FAILED:
            case ErrorCode.HANDOFF_SESSION_EXPIRED:
            case ErrorCode.HANDOFF_SESSION_INVALID:
            case ErrorCode.VALIDATION_FAILED:
                return HttpStatus.BAD_REQUEST; // 400
            default:
                return HttpStatus.INTERNAL_SERVER_ERROR; // 500
        }
    }
}