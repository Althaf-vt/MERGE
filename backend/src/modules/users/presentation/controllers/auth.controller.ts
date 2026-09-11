import { Body, Controller, HttpCode, HttpStatus, Inject, Post, Req, Res, UnauthorizedException } from "@nestjs/common";
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
import { IRegisterUserUseCase } from "../../application/interfaces/register-user.use-case.interface";
import { IVerifyOtpUseCase } from "../../application/interfaces/verify-otp.use-case.interface";
import { ILoginUserUseCase } from "../../application/interfaces/login-user.use-case.interface";
import { IRefreshTokenUseCase } from "../../application/interfaces/refresh-token.use-case.interface";

// Handles authentication-related HTTP requests such as registration and OTP verfication.
@Controller('auth')
export class AuthController{

    // Injects the use-cases responsible for registration and OTP verification.
    constructor(
        private readonly _registerUserUseCase: IRegisterUserUseCase,
        private readonly _verifyOtpUseCase: IVerifyOtpUseCase,
        private readonly _loginUserUseCase: ILoginUserUseCase,
        private readonly _refreshTokenUseCase: IRefreshTokenUseCase,
        @Inject(RESEND_OTP_USE_CASE) 
        private readonly _resendOtpUseCase: IResendOtpUseCase,
        @Inject(FORGOT_PASSWORD_USE_CASE)
        private readonly _forgotPasswordUseCase: IForgotPasswordUseCase,
        @Inject(RESET_PASSWORD_USE_CASE)
        private readonly _resetPasswordUseCase: IResetPasswordUseCase,
        @Inject(GOOGLE_LOGIN_USE_CASE)
        private readonly _googleLoginUseCase: IGoogleLoginUseCase
    ){}

    // Handles user registration requests. 
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() dto: RegisterUserDto){
        await this._registerUserUseCase.execute(dto);

        return{
            message: "Registration started. Please check you mail for the OTP"
        }
    }

    // Handles OTP verification requests.
    @Post('verify-otp')
    @HttpCode(HttpStatus.OK)
    async verifyOtp(@Body() dto: VerifyOtpDto){
        const user = await this._verifyOtpUseCase.execute(dto);

        return {
            message: "Email verified successfully",
            user: UserResponseMapper.toResponse(user),
        }
    }

    @Post('resend-otp')
    @HttpCode(HttpStatus.OK)
    async resendOtp(@Body() dto: ResendOtpDto){
        await this._resendOtpUseCase.execute(dto);
        return {message: "A new verification code has been sent."}
    }

    // Handle User Login Requests
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() dto: LoginUserDto, @Res({passthrough: true}) res: Response){
        const result = await this._loginUserUseCase.execute(dto);

        // Aet the refresh token as an HttpOnly, Secure cookie
        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // True in prod (HTTPS)
            sameSite: 'strict', // Prevents CSRF attacks
            maxAge: 7 * 24 * 60 * 60 * 100 // 7 days in ms
        });

        // Return only the access token and user data to the frontend
        return {
            message: "Login Successful",
            accessToken: result.accessToken,
            user: UserResponseMapper.toResponse(result.user)
        }
    }

    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    async forgotPassword(@Body() dto: ForgotPasswordDto) {
        await this._forgotPasswordUseCase.execute(dto);
        return { message: 'If an account exists, a reset code has been sent.' };
    }

    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    async resetPassword(@Body() dto: ResetPasswordDto) {
        await this._resetPasswordUseCase.execute(dto);
        return { message: 'Password has been successfully reset.' };
    }

    @Post('google')
    @HttpCode(HttpStatus.OK)
    async googleLogin(
        @Body() dto: GoogleLoginDto,
        @Res({passthrough: true}) res: Response
    ){
        const result = await this._googleLoginUseCase.execute(dto);

        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        })

        return {
            accessToken: result.accessToken,
            user: result.user
        }
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(@Req() req: Request, @Res({passthrough: true}) res: Response){
        // Extract the token directly from the incoming cookie
        const refreshToken = req.cookies['refreshToken'];

        if(!refreshToken){
            throw new UnauthorizedException("No refresh token found");
        }

        // Execute the use case by passing the extracted string directly
        const result = await this._refreshTokenUseCase.execute({refreshToken});

        // Rotate the refresh token by setting a fresh cookie
        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        // Return the new access token to the frontend
        return {
            accessToken: result.accessToken,
            user: UserResponseMapper.toResponse(result.user)
        }
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(@Res({passthrough: true}) res: Response){
        // Clear the cookie matching the options used when set
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });
        return { message: "Logged out successfully" };
    }
}

