// Unique DI token to identify the OTP service implementation.
export const OTP_SERVICE = Symbol('OTP_SERVICE');

// Defines the operations required for storing, verifiying, and deleting OTPs
export interface IOtpService {
    storeOtp(email: string, otp: string, ttlSeconds: number): Promise<void>;
    verifyOtp(email: string, otp: string): Promise<boolean>;
    deleteOtp(email: string): Promise<void>;
}