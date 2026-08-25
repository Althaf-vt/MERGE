export const EMAIL_SERVICE = Symbol('EMAIL_SERVICE');

export interface IEmailService{
    sendOtpEmail(to: string, otp: string): Promise<void>;
    // You can add more methods here later, like:
    // sendWelcomeEmail(to: string, name: string): Promise<void>;
}