import { Body, Controller, HttpCode, HttpStatus, Inject, Post, Res } from "@nestjs/common";
import { ADMIN_LOGIN_USE_CASE, IAdminLoginUseCase } from "../../application/interfaces/admin-login.use-case.interface";
import { AdminLoginDto } from "../../application/dtos/admin-login.dto";
import { Response } from "express";
import { AdminResponseMapper } from "../mappers/admin-response.mapper";
import { ADMIN_FORGOT_PASSWORD_USE_CASE, ADMIN_RESET_PASSWORD_USE_CASE, IAdminForgotPasswordUseCase } from "../../application/interfaces/admin-forgot-password.use-case.interface";
import { IResetPasswordUseCase } from "../../../users/application/interfaces/forgot-password.use-case.interface";
import { AdminForgotPasswordDto, AdminResetPasswordDto } from "../../application/dtos/admin-forgot-password.dto";




@Controller('admin/auth')
export class AdminAuthController {
    constructor(
        @Inject(ADMIN_LOGIN_USE_CASE)
        private readonly _adminLoginUseCase: IAdminLoginUseCase,
        @Inject(ADMIN_FORGOT_PASSWORD_USE_CASE)
        private readonly _forgotPasswordUseCase: IAdminForgotPasswordUseCase,
        @Inject(ADMIN_RESET_PASSWORD_USE_CASE)
        private readonly _resetPasswordUseCase: IResetPasswordUseCase,
    ){}

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() dto: AdminLoginDto, @Res({passthrough: true}) res: Response) {
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

    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    async forgotPassword(@Body() dto: AdminForgotPasswordDto) {
        await this._forgotPasswordUseCase.execute(dto);
        return { message: "If an admin account exists, a reset code has been sent." };
    }

    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    async resetPassword(@Body() dto: AdminResetPasswordDto) {
        await this._resetPasswordUseCase.execute(dto);
        return { message: "Password reset successfully. You can now log in." };
    }
}