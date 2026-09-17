import { Body, Controller, HttpCode, HttpStatus, Inject, Post, Req, Res, UnauthorizedException } from "@nestjs/common";
import { ADMIN_LOGIN_USE_CASE, IAdminLoginUseCase } from "../../application/interfaces/admin-login.use-case.interface";
import { AdminLoginDto } from "../../application/dtos/admin-login.dto";
import { Request, Response } from "express";
import { AdminResponseMapper } from "../mappers/admin-response.mapper";
import { ADMIN_FORGOT_PASSWORD_USE_CASE, ADMIN_RESET_PASSWORD_USE_CASE, ADMIN_VERIFY_RESET_OTP_USE_CASE, IAdminForgotPasswordUseCase, IAdminResetPasswordUseCase, IAdminVerifyResetOtpUseCase } from "../../application/interfaces/admin-forgot-password.use-case.interface";
import { AdminForgotPasswordDto, AdminResetPasswordDto, AdminVerifyResetOtpDto } from "../../application/dtos/admin-forgot-password.dto";
import { ADMIN_REFRESH_TOKEN_USE_CASE, IAdminRefreshTokenUseCase } from "../../application/interfaces/admin-refresh-token.use-case.interface";




@Controller('admin/auth')
export class AdminAuthController {
    constructor(
        @Inject(ADMIN_LOGIN_USE_CASE)
        private readonly _adminLoginUseCase: IAdminLoginUseCase,
        @Inject(ADMIN_FORGOT_PASSWORD_USE_CASE)
        private readonly _forgotPasswordUseCase: IAdminForgotPasswordUseCase,
        @Inject(ADMIN_RESET_PASSWORD_USE_CASE)
        private readonly _resetPasswordUseCase: IAdminResetPasswordUseCase,
        @Inject(ADMIN_VERIFY_RESET_OTP_USE_CASE)
        private readonly _adminVerifyResetOtpUseCase: IAdminVerifyResetOtpUseCase,
        @Inject(ADMIN_REFRESH_TOKEN_USE_CASE)
        private readonly _adminRefreshTokenUseCase: IAdminRefreshTokenUseCase,
    ) { }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() dto: AdminLoginDto, @Res({ passthrough: true }) res: Response) {
        const result = await this._adminLoginUseCase.execute(dto);

        res.cookie('adminRefreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return {
            message: "Admin login successful",
            accessToken: result.accessToken,
            admin: AdminResponseMapper.toResponse(result.admin)
        };
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const refreshToken = req.cookies['adminRefreshToken'];

        if (!refreshToken) {
            throw new UnauthorizedException("No refresh token found");
        }

        const result = await this._adminRefreshTokenUseCase.execute(refreshToken);

        res.cookie('adminRefreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return {
            accessToken: result.accessToken,
            admin: AdminResponseMapper.toResponse(result.admin)
        };
    }

    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    async forgotPassword(@Body() dto: AdminForgotPasswordDto) {
        await this._forgotPasswordUseCase.execute(dto);
        return { message: "If an admin account exists, a reset code has been sent." };
    }

    @Post('verify-reset-otp')
    @HttpCode(HttpStatus.OK)
    async verifyResetOtp(@Body() dto: AdminVerifyResetOtpDto) {
        await this._adminVerifyResetOtpUseCase.execute(dto);
        return { message: "Verification code is valid." };
    }

    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    async resetPassword(@Body() dto: AdminResetPasswordDto) {
        await this._resetPasswordUseCase.execute(dto);
        return { message: "Password reset successfully. You can now log in." };
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie('adminRefreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });
        return { message: "Admin logged out successfully" };
    }
}