import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { CONFIRM_EMAIL_CHANGE_USE_CASE, DEACTIVATE_ACCOUNT_USE_CASE, DELETE_ACCOUNT_USE_CASE, GET_ACTIVE_SESSIONS_USE_CASE, IConfirmEmailChangeUseCase, IDeactivateAccountUseCase, IDeleteAccountUseCase, IGetActiveSessionsUseCase, IInitiateEmailChangeUseCase, INITIATE_EMAIL_CHANGE_USE_CASE, IRequestSecurityOtpUseCase, IRevokeOtherSessionsUseCase, IRevokeSessionUseCase, IUpdateSecurityPasswordUseCase, REQUEST_SECURITY_OTP_USE_CASE, REVOKE_OTHER_SESSIONS_USE_CASE, REVOKE_SESSION_USE_CASE, UPDATE_SECURITY_PASSWORD_USE_CASE } from "../../application/interfaces/security-management.use-case.interface";
import { JwtAuthGuard } from "../../../../shared/infrastructure/security/guards/jwt-auth.guard";
import { ConfirmEmailChangeDto, InitiateEmailChangeDto, UpdateSecurityPasswordDto } from "../../application/dtos/security-management.dto";
import { UserSessionGuard } from "../../../../shared/infrastructure/security/guards/user-session.guard";
import { AuthenticatedRequest } from "../../../../shared/infrastructure/security/interfaces/authenticated-request.interface";
import { API_ENDPOINTS } from "../../../../shared/presentation/constants/api-endpoints.constant";
import { ApiResponse } from "../../../../shared/presentation/interfaces/api-response.interface";
import { RESPONSE_MESSAGES } from "../../../../shared/presentation/constants/response-messages.constant";
import { UserSessionData } from "../../../../shared/domain/interfaces/user-session.interface";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";

@Controller(API_ENDPOINTS.PROFILE.BASE)
@UseGuards(JwtAuthGuard, UserSessionGuard)
export class SecurityController {
    constructor(
        @Inject(REQUEST_SECURITY_OTP_USE_CASE) private readonly _requestOtpUseCase: IRequestSecurityOtpUseCase,
        @Inject(UPDATE_SECURITY_PASSWORD_USE_CASE) private readonly _updatePasswordUseCase: IUpdateSecurityPasswordUseCase,
        @Inject(DEACTIVATE_ACCOUNT_USE_CASE) private readonly _deactivateUseCase: IDeactivateAccountUseCase,
        @Inject(DELETE_ACCOUNT_USE_CASE) private readonly _deleteUseCase: IDeleteAccountUseCase,
        @Inject(GET_ACTIVE_SESSIONS_USE_CASE) private readonly _getSessionsUseCase: IGetActiveSessionsUseCase,
        @Inject(REVOKE_SESSION_USE_CASE) private readonly _revokeSessionUseCase: IRevokeSessionUseCase,
        @Inject(REVOKE_OTHER_SESSIONS_USE_CASE) private readonly _revokeOtherSessionsUseCase: IRevokeOtherSessionsUseCase,
        @Inject(INITIATE_EMAIL_CHANGE_USE_CASE) private readonly _initiateEmailChangeUseCase: IInitiateEmailChangeUseCase,
        @Inject(CONFIRM_EMAIL_CHANGE_USE_CASE) private readonly _confirmEmailChangeUseCase: IConfirmEmailChangeUseCase,
    ) { }

    @Post(API_ENDPOINTS.PROFILE.SECURITY_OTP_REQUEST)
    @HttpCode(HttpStatus.OK)
    async requestOtp(@Req() req: AuthenticatedRequest): Promise<ApiResponse<undefined>> {
        await this._requestOtpUseCase.execute(req.user.userId);
        return {
            success: true,
            message: RESPONSE_MESSAGES.SECURITY.OTP_REQUESTED
        };
    }

    @Patch(API_ENDPOINTS.PROFILE.SECURITY_PASSWORD)
    @HttpCode(HttpStatus.OK)
    async updatePassword(
        @Req() req: AuthenticatedRequest,
        @Body() dto: UpdateSecurityPasswordDto
    ): Promise<ApiResponse<undefined>> {
        await this._updatePasswordUseCase.execute(req.user.userId, dto);
        return {
            success: true,
            message: RESPONSE_MESSAGES.SECURITY.PASSWORD_UPDATED
        };
    }

    @Patch(API_ENDPOINTS.PROFILE.SECURITY_ACCOUNT_DEACTIVATE)
    @HttpCode(HttpStatus.OK)
    async deactivateAccount(@Req() req: AuthenticatedRequest): Promise<ApiResponse<undefined>> {
        await this._deactivateUseCase.execute(req.user.userId);
        return {
            success: true,
            message: RESPONSE_MESSAGES.SECURITY.ACCOUNT_DEACTIVATED
        };
    }

    @Delete(API_ENDPOINTS.PROFILE.SECURITY_ACCOUNT_DELETE)
    @HttpCode(HttpStatus.OK)
    async deleteAccount(@Req() req: AuthenticatedRequest): Promise<ApiResponse<undefined>> {
        await this._deleteUseCase.execute(req.user.userId);
        return {
            success: true,
            message: RESPONSE_MESSAGES.SECURITY.ACCOUNT_DELETED
        };
    }

    @Post(API_ENDPOINTS.PROFILE.SECURITY_EMAIL_INITIATE)
    @HttpCode(HttpStatus.OK)
    async initiateEmailChange(
        @Req() req: AuthenticatedRequest,
        @Body() dto: InitiateEmailChangeDto
    ): Promise<ApiResponse<undefined>> {
        await this._initiateEmailChangeUseCase.execute(req.user.userId, dto);
        return {
            success: true,
            message: RESPONSE_MESSAGES.SECURITY.EMAIL_CHANGE_INITIATED
        };
    }

    @Patch(API_ENDPOINTS.PROFILE.SECURITY_EMAIL_CONFIRM)
    @HttpCode(HttpStatus.OK)
    async confirmEmailChange(
        @Req() req: AuthenticatedRequest,
        @Body() dto: ConfirmEmailChangeDto
    ): Promise<ApiResponse<undefined>> {
        await this._confirmEmailChangeUseCase.execute(req.user.userId, dto);
        return {
            success: true,
            message: RESPONSE_MESSAGES.SECURITY.EMAIL_CHANGED
        };
    }

    @Get(API_ENDPOINTS.PROFILE.SECURITY_SESSIONS)
    @HttpCode(HttpStatus.OK)
    async getActiveSessions(@Req() req: AuthenticatedRequest): Promise<ApiResponse<UserSessionData[]>> {
        const currentSessionId = req.user.sessionId;
        if (!currentSessionId) {
            throw new DomainException(ErrorCode.UNAUTHORIZED, "Session context is missing.");
        }

        const sessions = await this._getSessionsUseCase.execute(req.user.userId, currentSessionId);
        return {
            success: true,
            data: sessions
        };
    }

    @Delete(API_ENDPOINTS.PROFILE.SECURITY_SESSIONS_OTHER)
    @HttpCode(HttpStatus.OK)
    async revokeAllOtherSessions(@Req() req: AuthenticatedRequest): Promise<ApiResponse<undefined>> {
        const currentSessionId = req.user.sessionId;
        if (!currentSessionId) {
            throw new DomainException(ErrorCode.UNAUTHORIZED, "Session ID is required to revoke other sessions.");
        }

        await this._revokeOtherSessionsUseCase.execute(req.user.userId, currentSessionId);
        return {
            success: true,
            message: RESPONSE_MESSAGES.SECURITY.ALL_SESSIONS_REVOKED
        };
    }

    @Delete(API_ENDPOINTS.PROFILE.SECURITY_SESSIONS_REVOKE)
    @HttpCode(HttpStatus.OK)
    async revokeSession(
        @Req() req: AuthenticatedRequest,
        @Param('sessionId') sessionId: string
    ): Promise<ApiResponse<undefined>> {
        await this._revokeSessionUseCase.execute(req.user.userId, { sessionId });
        return {
            success: true,
            message: RESPONSE_MESSAGES.SECURITY.SESSION_REVOKED
        };
    }
}