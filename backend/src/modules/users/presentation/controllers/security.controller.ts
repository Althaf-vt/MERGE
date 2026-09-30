import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { CONFIRM_EMAIL_CHANGE_USE_CASE, DEACTIVATE_ACCOUNT_USE_CASE, DELETE_ACCOUNT_USE_CASE, GET_ACTIVE_SESSIONS_USE_CASE, IConfirmEmailChangeUseCase, IDeactivateAccountUseCase, IDeleteAccountUseCase, IGetActiveSessionsUseCase, IInitiateEmailChangeUseCase, INITIATE_EMAIL_CHANGE_USE_CASE, IRequestSecurityOtpUseCase, IRevokeOtherSessionsUseCase, IRevokeSessionUseCase, IUpdateSecurityPasswordUseCase, REQUEST_SECURITY_OTP_USE_CASE, REVOKE_OTHER_SESSIONS_USE_CASE, REVOKE_SESSION_USE_CASE, UPDATE_SECURITY_PASSWORD_USE_CASE } from "../../application/interfaces/security-management.use-case.interface";
import { JwtAuthGuard } from "../../../../shared/infrastructure/security/guards/jwt-auth.guard";
import { ConfirmEmailChangeDto, InitiateEmailChangeDto, UpdateSecurityPasswordDto } from "../../application/dtos/security-management.dto";

@Controller('profile/security')
@UseGuards(JwtAuthGuard)
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

    @Post('otp/request')
    @HttpCode(HttpStatus.OK)
    async requestOtp(@Req() req: any){
        await this._requestOtpUseCase.execute(req.user.userId);
        return {success: true, message: 'Verification code sent to your registered email.'}
    }

    @Patch('password')
    @HttpCode(HttpStatus.OK)
    async updatePassword(@Req() req: any, @Body() dto: UpdateSecurityPasswordDto) {
        await this._updatePasswordUseCase.execute(req.user.userId, dto);
        return { success: true, message: 'Password updated successfully. You will be logged out of all devices.' };
    }

    @Patch('account/deactivate')
    @HttpCode(HttpStatus.OK)
    async deactivateAccount(@Req() req: any) {
        await this._deactivateUseCase.execute(req.user.userId);
        return { success: true, message: 'Account has been deactivated. You have been logged out.' };
    }

    @Delete('account/delete')
    @HttpCode(HttpStatus.OK)
    async deleteAccount(@Req() req: any) {
        await this._deleteUseCase.execute(req.user.userId);
        return { success: true, message: 'Account scheduled for permanent deletion.' };
    }

    @Post('email/initiate')
    @HttpCode(HttpStatus.OK)
    async initiateEmailChange(@Req() req: any, @Body() dto: InitiateEmailChangeDto) {
        await this._initiateEmailChangeUseCase.execute(req.user.userId, dto);
        return { 
            success: true, 
            message: 'Current email verified. A new verification code has been sent to your new email address.' 
        };
    }

    @Patch('email/confirm')
    @HttpCode(HttpStatus.OK)
    async confirmEmailChange(@Req() req: any, @Body() dto: ConfirmEmailChangeDto) {
        await this._confirmEmailChangeUseCase.execute(req.user.userId, dto);
        return { 
            success: true, 
            message: 'Email address updated successfully. You have been logged out of all devices. Please log in again.' 
        };
    }

    @Get('sessions')
    @HttpCode(HttpStatus.OK)
    async getActiveSessions(@Req() req: any) {
        const sessions = await this._getSessionsUseCase.execute(req.user.userId);
        return { success: true, data: sessions };
    }

    @Delete('sessions/other')
    @HttpCode(HttpStatus.OK)
    async revokeAllOtherSessions(@Req() req: any) {
        // Requires passing the current sessionId inside the JWT payload in auth flows
        const currentSessionId = req.user.sessionId; 
        await this._revokeOtherSessionsUseCase.execute(req.user.userId, currentSessionId);
        return { success: true, message: 'Successfully signed out of all other devices.' };
    }

    @Delete('sessions/:sessionId')
    @HttpCode(HttpStatus.OK)
    async revokeSession(@Req() req: any, @Param('sessionId') sessionId: string) {
        await this._revokeSessionUseCase.execute(req.user.userId, { sessionId });
        return { success: true, message: 'Session terminated successfully.' };
    }
}