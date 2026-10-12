import { Body, Controller, HttpCode, HttpStatus, Inject, Logger, Post, Req, Res, UnauthorizedException } from "@nestjs/common";
import { RegisterUserDto } from "../../application/dtos/register-user.dto";
import { UserResponseMapper } from "../mappers/user-response.mapper";
import { VerifyOtpDto } from "../../application/dtos/verify-otp.dto";
import { LoginUserDto } from "../../application/dtos/login-user.dto";
import type { Request, Response } from "express";
import { ResendOtpDto } from "../../application/dtos/resend-otp.dto";
import { IResendOtpUseCase, RESEND_OTP_USE_CASE } from "../../application/interfaces/resend-otp.use-case.interface";
import { FORGOT_PASSWORD_USE_CASE, IForgotPasswordUseCase, IResetPasswordUseCase, RESET_PASSWORD_USE_CASE } from "../../application/interfaces/forgot-password.use-case.interface";
import { ForgotPasswordDto, ResetPasswordDto } from "../../application/dtos/forgot-password.dto";
import { GoogleLoginDto } from "../../application/dtos/google-login.dto";
import { GOOGLE_LOGIN_USE_CASE, IGoogleLoginUseCase } from "../../application/interfaces/google-login.use-case.interface";
import { IRegisterUserUseCase, REGISTER_USER_USE_CASE } from "../../application/interfaces/register-user.use-case.interface";
import { IVerifyOtpUseCase, VERIFY_OTP_USE_CASE } from "../../application/interfaces/verify-otp.use-case.interface";
import { ILoginUserUseCase, LOGIN_USER_USE_CASE } from "../../application/interfaces/login-user.use-case.interface";
import { IRefreshTokenUseCase, REFRESH_TOKEN_USE_CASE } from "../../application/interfaces/refresh-token.use-case.interface";
import { IUserSessionService, USER_SESSION_SERVICE } from "../../../../shared/domain/interfaces/user-session.interface";
import { ITokenservice, TOKEN_SERVICE } from "../../../../shared/domain/interfaces/token-service.interface";
import { ClientInfo, ClientInfoData } from "../../../../shared/infrastructure/security/decorators/client-info.decorator";
import { API_ENDPOINTS } from "../../../../shared/domain/constants/api-endpoints.constant";
import { ApiResponse } from "../../../../shared/domain/interfaces/api-response.interface";
import { RESPONSE_MESSAGES } from "../../../../shared/domain/constants/response-messages.constant";
import { UserResponseDto } from "../../application/dtos/user-response.dto";


@Controller(API_ENDPOINTS.AUTH.BASE)
export class AuthController {
    constructor(
        @Inject(REGISTER_USER_USE_CASE) private readonly _registerUserUseCase: IRegisterUserUseCase,
        @Inject(VERIFY_OTP_USE_CASE) private readonly _verifyOtpUseCase: IVerifyOtpUseCase,
        @Inject(LOGIN_USER_USE_CASE) private readonly _loginUserUseCase: ILoginUserUseCase,
        @Inject(REFRESH_TOKEN_USE_CASE) private readonly _refreshTokenUseCase: IRefreshTokenUseCase,
        @Inject(RESEND_OTP_USE_CASE) private readonly _resendOtpUseCase: IResendOtpUseCase,
        @Inject(FORGOT_PASSWORD_USE_CASE) private readonly _forgotPasswordUseCase: IForgotPasswordUseCase,
        @Inject(RESET_PASSWORD_USE_CASE) private readonly _resetPasswordUseCase: IResetPasswordUseCase,
        @Inject(GOOGLE_LOGIN_USE_CASE) private readonly _googleLoginUseCase: IGoogleLoginUseCase,
        @Inject(USER_SESSION_SERVICE) private readonly _sessionService: IUserSessionService,
        @Inject(TOKEN_SERVICE) private readonly _tokenService: ITokenservice,
    ){}
    private readonly _logger = new Logger(AuthController.name);

    @Post(API_ENDPOINTS.AUTH.REGISTER)
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() dto: RegisterUserDto): Promise<ApiResponse<undefined>> {
        await this._registerUserUseCase.execute(dto);
        return {
            success: true,
            message: RESPONSE_MESSAGES.AUTH.REGISTER_SUCCESS
        };
    }

    @Post(API_ENDPOINTS.AUTH.VERIFY_OTP)
    @HttpCode(HttpStatus.OK)
    async verifyOtp(@Body() dto: VerifyOtpDto): Promise<ApiResponse<UserResponseDto>> {
        const user = await this._verifyOtpUseCase.execute(dto);
        return {
            success: true,
            message: RESPONSE_MESSAGES.AUTH.EMAIL_VERIFIED,
            data: UserResponseMapper.toResponse(user),
        };
    }

    @Post(API_ENDPOINTS.AUTH.RESEND_OTP)
    @HttpCode(HttpStatus.OK)
    async resendOtp(@Body() dto: ResendOtpDto): Promise<ApiResponse<undefined>> {
        await this._resendOtpUseCase.execute(dto);
        return {
            success: true,
            message: RESPONSE_MESSAGES.AUTH.REGISTER_SUCCESS // Reuse standard OTP message
        };
    }

    @Post(API_ENDPOINTS.AUTH.LOGIN)
    @HttpCode(HttpStatus.OK)
    async login(
        @Body() dto: LoginUserDto, 
        @ClientInfo() client: ClientInfoData, 
        @Res({passthrough: true}) res: Response
    ): Promise<ApiResponse<{ accessToken: string; user: UserResponseDto }>> {
        const result = await this._loginUserUseCase.execute(dto, client.deviceInfo, client.ipAddress);

        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: Number(process.env.REFRESH_TOKEN_MAX_AGE) || 7 * 24 * 60 * 60 * 1000
        });

        return {
            success: true,
            message: RESPONSE_MESSAGES.AUTH.LOGIN_SUCCESS,
            data: {
                accessToken: result.accessToken,
                user: UserResponseMapper.toResponse(result.user)
            }
        };
    }

    @Post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD)
    @HttpCode(HttpStatus.OK)
    async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<ApiResponse<undefined>> {
        await this._forgotPasswordUseCase.execute(dto);
        return { 
            success: true,
            message: RESPONSE_MESSAGES.AUTH.PASSWORD_RESET_OTP_SENT 
        };
    }

    @Post(API_ENDPOINTS.AUTH.RESET_PASSWORD)
    @HttpCode(HttpStatus.OK)
    async resetPassword(@Body() dto: ResetPasswordDto): Promise<ApiResponse<undefined>> {
        await this._resetPasswordUseCase.execute(dto);
        return { 
            success: true,
            message: RESPONSE_MESSAGES.AUTH.PASSWORD_RESET_SUCCESS 
        };
    }

    @Post(API_ENDPOINTS.AUTH.GOOGLE)
    @HttpCode(HttpStatus.OK)
    async googleLogin(
        @Body() dto: GoogleLoginDto,
        @ClientInfo() client: ClientInfoData,
        @Res({passthrough: true}) res: Response
    ): Promise<ApiResponse<{ accessToken: string; user: UserResponseDto }>> {
        const result = await this._googleLoginUseCase.execute(dto, client.deviceInfo, client.ipAddress);

        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: Number(process.env.REFRESH_TOKEN_MAX_AGE) || 7 * 24 * 60 * 60 * 1000
        });

        return {
            success: true,
            message: RESPONSE_MESSAGES.AUTH.LOGIN_SUCCESS,
            data: {
                accessToken: result.accessToken,
                user: UserResponseMapper.toResponse(result.user)
            }
        };
    }

    @Post(API_ENDPOINTS.AUTH.REFRESH)
    @HttpCode(HttpStatus.OK)
    async refresh(
        @Req() req: Request, 
        @Res({passthrough: true}) res: Response
    ): Promise<ApiResponse<{ accessToken: string; user: UserResponseDto }>> {
        const refreshToken = req.cookies['refreshToken'];
        if(!refreshToken){
            throw new UnauthorizedException("No refresh token found");
        }

        const result = await this._refreshTokenUseCase.execute({refreshToken});

        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: Number(process.env.REFRESH_TOKEN_MAX_AGE) || 7 * 24 * 60 * 60 * 1000,
        });

        return {
            success: true,
            message: RESPONSE_MESSAGES.AUTH.TOKEN_REFRESHED,
            data: {
                accessToken: result.accessToken,
                user: UserResponseMapper.toResponse(result.user)
            }
        };
    }

    @Post(API_ENDPOINTS.AUTH.LOGOUT)
    @HttpCode(HttpStatus.OK)
    async logout(@Req() req: Request, @Res({passthrough: true}) res: Response): Promise<ApiResponse<undefined>> {
        const refreshToken = req.cookies['refreshToken'];

        if(refreshToken){
            try {
                const payload = this._tokenService.verifyRefreshToken(refreshToken);
                if(payload && payload.userId && payload.sessionId){
                    await this._sessionService.revokeSession(payload.userId, payload.sessionId);
                }
            } catch (error) {
                this._logger.debug('Refresh token invalid during logout; proceeding with cookie cleanup.');
            }
        }
        res.clearCookie('refreshToken', {
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