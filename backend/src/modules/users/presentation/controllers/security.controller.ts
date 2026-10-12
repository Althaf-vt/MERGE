import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { CONFIRM_EMAIL_CHANGE_USE_CASE, DEACTIVATE_ACCOUNT_USE_CASE, DELETE_ACCOUNT_USE_CASE, GET_ACTIVE_SESSIONS_USE_CASE, IConfirmEmailChangeUseCase, IDeactivateAccountUseCase, IDeleteAccountUseCase, IGetActiveSessionsUseCase, IInitiateEmailChangeUseCase, INITIATE_EMAIL_CHANGE_USE_CASE, IRequestSecurityOtpUseCase, IRevokeOtherSessionsUseCase, IRevokeSessionUseCase, IUpdateSecurityPasswordUseCase, REQUEST_SECURITY_OTP_USE_CASE, REVOKE_OTHER_SESSIONS_USE_CASE, REVOKE_SESSION_USE_CASE, UPDATE_SECURITY_PASSWORD_USE_CASE } from "../../application/interfaces/security-management.use-case.interface";
import { JwtAuthGuard } from "../../../../shared/infrastructure/security/guards/jwt-auth.guard";
import { ConfirmEmailChangeDto, InitiateEmailChangeDto, UpdateSecurityPasswordDto } from "../../application/dtos/security-management.dto";
import { UserSessionGuard } from "../../../../shared/infrastructure/security/guards/user-session.guard";
import { AuthenticatedRequest } from "../../../../shared/infrastructure/security/interfaces/authenticated-request.interface";
import { API_ENDPOINTS } from "../../../../shared/domain/constants/api-endpoints.constant";
import { ApiResponse } from "../../../../shared/domain/interfaces/api-response.interface";
import { RESPONSE_MESSAGES } from "../../../../shared/domain/constants/response-messages.constant";
import { UserSessionData } from "../../../../shared/domain/interfaces/user-session.interface";

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

    @Post('security/otp/request')
    @HttpCode(HttpStatus.OK)
    async requestOtp(@Req() req: AuthenticatedRequest): Promise<ApiResponse<undefined>> {
        await this._requestOtpUseCase.execute(req.user.userId);
        return { 
            success: true, 
            message: RESPONSE_MESSAGES.SECURITY.OTP_REQUESTED 
        };
    }

    @Patch('security/password')
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

    @Patch('security/account/deactivate')
    @HttpCode(HttpStatus.OK)
    async deactivateAccount(@Req() req: AuthenticatedRequest): Promise<ApiResponse<undefined>> {
        await this._deactivateUseCase.execute(req.user.userId);
        return { 
            success: true, 
            message: RESPONSE_MESSAGES.SECURITY.ACCOUNT_DEACTIVATED 
        };
    }

    @Delete('security/account/delete')
    @HttpCode(HttpStatus.OK)
    async deleteAccount(@Req() req: AuthenticatedRequest): Promise<ApiResponse<undefined>> {
        await this._deleteUseCase.execute(req.user.userId);
        return { 
            success: true, 
            message: RESPONSE_MESSAGES.SECURITY.ACCOUNT_DELETED 
        };
    }

    @Post('security/email/initiate')
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

    @Patch('security/email/confirm')
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

    @Get('security/sessions')
    @HttpCode(HttpStatus.OK)
    async getActiveSessions(@Req() req: AuthenticatedRequest): Promise<ApiResponse<UserSessionData[]>> {
        const sessions = await this._getSessionsUseCase.execute(req.user.userId);
        return { 
            success: true, 
            data: sessions 
        };
    }

    // @Get('security/sessions')
    // @HttpCode(HttpStatus.OK)
    // async getActiveSessions(@Req() req: AuthenticatedRequest): Promise<ApiResponse<Record<string, unknown>[]>> {
    //     const sessions = await this._getSessionsUseCase.execute(req.user.userId);
    //     return { 
    //         success: true, 
    //         data: sessions 
    //     };
    // }

    @Delete('security/sessions/other')
    @HttpCode(HttpStatus.OK)
    async revokeAllOtherSessions(@Req() req: AuthenticatedRequest): Promise<ApiResponse<undefined>> {
        const currentSessionId = req.user.sessionId; 
        // Strict runtime check to prevent deleting everything accidentally
        if(!currentSessionId) throw new Error("Session ID is required to revoke other sessions");
        
        await this._revokeOtherSessionsUseCase.execute(req.user.userId, currentSessionId);
        return { 
            success: true, 
            message: RESPONSE_MESSAGES.SECURITY.ALL_SESSIONS_REVOKED 
        };
    }

    @Delete('security/sessions/:sessionId')
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