// Unique DI token to identify the OTP service implementation.
export const OTP_SERVICE = Symbol('OTP_SERVICE');

// Defines the operations required for storing, verifiying, and deleting OTPs
export interface IOtpService {
    // Store the passwordHash alongside the OTP
    storeRegistrationDraft(email: string, otp: string, passwordHash: string, ttlSeconds: number): Promise<void>;

    // Verifies the OTP and returns the temporary data if successful
    verifyAndRetrieveDraft(email: string, otp: string): Promise<{ passwordHash: string } | null>;
    deleteDraft(email: string): Promise<void>;
    refreshRegistrationDraft(email: string, newOtp: string, ttlSeconds: number): Promise<void>;

    // Password Reset operations
    storePasswordResetOtp(email: string, otp: string, ttlSeconds: number): Promise<void>;
    verifyPasswordResetOtp(email: string, otp: string): Promise<boolean>;
    deletePasswordResetOtp(email: string): Promise<void>;

    // Dedicated Account Security Action Verification (Email change, sensitive actions)
    storeSecurityAuthOtp(email: string, otp: string, ttlSeconds: number): Promise<void>;
    verifySecurityAuthOtp(email: string, otp: string): Promise<boolean>;
    deleteSecurityAuthOtp(email: string): Promise<void>;

    // 2-step email change methods
    storeEmailChangeDraft(userId: string, newEmail: string, newOtp: string, ttlSeconds: number): Promise<void>;
    verifyAndRetrieveEmailChangeDraft(userId: string, submittedOtp: string): Promise<string | null>;
    deleteEmailChangeDraft(userId: string): Promise<void>;
}