export const EMAIL_SERVICE = Symbol('EMAIL_SERVICE');

export interface IEmailService {
    // For standard users (registration, etc.)
    sendOtpEmail(to: string, otp: string): Promise<void>;

    // For admins (password resets, high-security actions)
    sendAdminResetOtpEmail(to: string, otp: string): Promise<void>;
    sendAdminInviteEmail(to: string, token: string, inviterName: string): Promise<void>;
    // EDA notification contracts
    sendBanNotificationEmail(to: string, reason: string): Promise<void>;
    sendSuspensionNotificationEmail(to: string, reason: string, until: Date): Promise<void>;
}