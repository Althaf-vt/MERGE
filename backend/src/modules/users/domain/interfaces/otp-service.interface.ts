// Unique DI token to identify the OTP service implementation.
export const OTP_SERVICE = Symbol('OTP_SERVICE');

// Defines the operations required for storing, verifiying, and deleting OTPs
export interface IOtpService {
    // Store the passwordHash alongside the OTP
    storeRegistrationDraft(email: string, otp: string, passwordHash: string, ttlSeconds: number): Promise<void>;
    
    // Verifies the OTP and returns the temporary data if successful
    verifyAndRetrieveDraft(email: string, otp: string): Promise<{passwordHash: string} | null>;
    
    deleteDraft(email: string): Promise<void>;
}