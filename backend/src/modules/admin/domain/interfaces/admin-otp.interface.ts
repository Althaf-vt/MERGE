export const ADMIN_OTP_SERVICE = 'ADMIN_OTP_SERVICE';

export interface IAdminOtpService {
    storePasswordResetOtp(email: string, otp: string, ttlSeconds: number): Promise<void>;
    verifyPasswordResetOtp(email: string, otp: string): Promise<boolean>;
    deletePasswordResetOtp(email: string): Promise<void>;
}