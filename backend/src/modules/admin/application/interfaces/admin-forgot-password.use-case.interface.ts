import { AdminForgotPasswordDto, AdminResetPasswordDto, AdminVerifyResetOtpDto } from "../dtos/admin-forgot-password.dto";

export const ADMIN_FORGOT_PASSWORD_USE_CASE = 'ADMIN_FORGOT_PASSWORD_USE_CASE';
export interface IAdminForgotPasswordUseCase {
    execute(dto: AdminForgotPasswordDto): Promise<void>;
}

export const ADMIN_RESET_PASSWORD_USE_CASE = 'ADMIN_RESET_PASSWORD_USE_CASE';
export interface IAdminResetPasswordUseCase {
    execute(dto: AdminResetPasswordDto): Promise<void>;
}

export const ADMIN_VERIFY_RESET_OTP_USE_CASE = 'ADMIN_VERIFY_RESET_OTP_USE_CASE';
export interface IAdminVerifyResetOtpUseCase {
    execute(dto: AdminVerifyResetOtpDto): Promise<void>;
}