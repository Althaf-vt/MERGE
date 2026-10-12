import { Body, Controller, HttpCode, HttpStatus, Inject, Post, Req, Res, UnauthorizedException } from "@nestjs/common";
import { ADMIN_LOGIN_USE_CASE, IAdminLoginUseCase } from "../../application/interfaces/admin-login.use-case.interface";
import { AdminLoginDto } from "../../application/dtos/admin-login.dto";
import { Request, Response } from "express";
import { AdminResponseMapper } from "../mappers/admin-response.mapper";
import { ADMIN_FORGOT_PASSWORD_USE_CASE, ADMIN_RESET_PASSWORD_USE_CASE, ADMIN_VERIFY_RESET_OTP_USE_CASE, IAdminForgotPasswordUseCase, IAdminResetPasswordUseCase, IAdminVerifyResetOtpUseCase } from "../../application/interfaces/admin-forgot-password.use-case.interface";
import { AdminForgotPasswordDto, AdminResetPasswordDto, AdminVerifyResetOtpDto } from "../../application/dtos/admin-forgot-password.dto";
import { ADMIN_REFRESH_TOKEN_USE_CASE, IAdminRefreshTokenUseCase } from "../../application/interfaces/admin-refresh-token.use-case.interface";
import { API_ENDPOINTS } from "../../../../shared/domain/constants/api-endpoints.constant";
import { ApiResponse } from "../../../../shared/domain/interfaces/api-response.interface";
import { RESPONSE_MESSAGES } from "../../../../shared/domain/constants/response-messages.constant";


@Controller(API_ENDPOINTS.ADMIN.AUTH.BASE)
export class AdminAuthController {
    constructor(
        @Inject(ADMIN_LOGIN_USE_CASE) private readonly _adminLoginUseCase: IAdminLoginUseCase,
        @Inject(ADMIN_FORGOT_PASSWORD_USE_CASE) private readonly _forgotPasswordUseCase: IAdminForgotPasswordUseCase,
        @Inject(ADMIN_RESET_PASSWORD_USE_CASE) private readonly _resetPasswordUseCase: IAdminResetPasswordUseCase,
        @Inject(ADMIN_VERIFY_RESET_OTP_USE_CASE) private readonly _adminVerifyResetOtpUseCase: IAdminVerifyResetOtpUseCase,
        @Inject(ADMIN_REFRESH_TOKEN_USE_CASE) private readonly _adminRefreshTokenUseCase: IAdminRefreshTokenUseCase,
    ) { }

    @Post(API_ENDPOINTS.ADMIN.AUTH.LOGIN)
    @HttpCode(HttpStatus.OK)
    async login(
        @Body() dto: AdminLoginDto, 
        @Res({ passthrough: true }) res: Response
    ): Promise<ApiResponse<{ accessToken: string; admin: Record<string, unknown> }>> {
        const result = await this._adminLoginUseCase.execute(dto);

        res.cookie('adminRefreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return {
            success: true,
            message: RESPONSE_MESSAGES.AUTH.LOGIN_SUCCESS,
            data: {
                accessToken: result.accessToken,
                admin: AdminResponseMapper.toResponse(result.admin)
            }
        };
    }

    @Post(API_ENDPOINTS.ADMIN.AUTH.REFRESH)
    @HttpCode(HttpStatus.OK)
    async refresh(
        @Req() req: Request, 
        @Res({ passthrough: true }) res: Response
    ): Promise<ApiResponse<{ accessToken: string; admin: Record<string, unknown> }>> {
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
        });

        return {
            success: true,
            message: RESPONSE_MESSAGES.AUTH.TOKEN_REFRESHED,
            data: {
                accessToken: result.accessToken,
                admin: AdminResponseMapper.toResponse(result.admin)
            }
        };
    }

    @Post(API_ENDPOINTS.ADMIN.AUTH.FORGOT_PASSWORD)
    @HttpCode(HttpStatus.OK)
    async forgotPassword(@Body() dto: AdminForgotPasswordDto): Promise<ApiResponse<undefined>> {
        await this._forgotPasswordUseCase.execute(dto);
        return { 
            success: true, 
            message: RESPONSE_MESSAGES.AUTH.PASSWORD_RESET_OTP_SENT 
        };
    }

    @Post(API_ENDPOINTS.ADMIN.AUTH.VERIFY_RESET_OTP)
    @HttpCode(HttpStatus.OK)
    async verifyResetOtp(@Body() dto: AdminVerifyResetOtpDto): Promise<ApiResponse<undefined>> {
        await this._adminVerifyResetOtpUseCase.execute(dto);
        return { 
            success: true, 
            message: RESPONSE_MESSAGES.AUTH.OTP_VERIFIED 
        };
    }

    @Post(API_ENDPOINTS.ADMIN.AUTH.RESET_PASSWORD)
    @HttpCode(HttpStatus.OK)
    async resetPassword(@Body() dto: AdminResetPasswordDto): Promise<ApiResponse<undefined>> {
        await this._resetPasswordUseCase.execute(dto);
        return { 
            success: true, 
            message: RESPONSE_MESSAGES.AUTH.PASSWORD_RESET_SUCCESS 
        };
    }

    @Post(API_ENDPOINTS.ADMIN.AUTH.LOGOUT)
    @HttpCode(HttpStatus.OK)
    async logout(@Res({ passthrough: true }) res: Response): Promise<ApiResponse<undefined>> {
        res.clearCookie('adminRefreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });
        return { 
            success: true, 
            message: RESPONSE_MESSAGES.AUTH.LOGOUT_SUCCESS 
        };
    }
}