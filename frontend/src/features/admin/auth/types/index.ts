import type { AdminUser } from "../slices/admin-auth.slice";

export interface AdminLoginPayload {
    email: string;
    password: string;
}

export interface AdminForgotPasswordPayload {
    email: string;
}

export interface AdminVerifyResetOtpPayload {
    email: string;
    otp: string;
}

export interface AdminResetPasswordPayload {
    email: string;
    otp: string;
    newPassword: string;
}

export interface AdminAuthSessionData {
    accessToken: string;
    admin: AdminUser;
}