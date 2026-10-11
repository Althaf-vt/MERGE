import type { AuthUser } from '../slices/auth.slice';

export type { AuthUser };

export interface RegisterUserDto {
    email: string;
    password: string;
}

export interface VerifyOtpDto {
    email: string;
    otp: string;
}

export interface ResendOtpDto {
    email: string;
}

export interface LoginUserDto {
    email: string;
    password: string;
}

export interface ForgotPasswordDto {
    email: string;
}

export interface ResetPasswordDto {
    email: string;
    otp: string;
    newPassword: string;
}

export interface GoogleLoginDto {
    idToken: string;
}

export interface AuthSessionData {
    accessToken: string;
    user: AuthUser;
}