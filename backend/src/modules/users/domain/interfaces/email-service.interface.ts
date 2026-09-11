export const EMAIL_SERVICE = Symbol('EMAIL_SERVICE');

export interface IEmailService{
    sendOtpEmail(to: string, otp: string): Promise<void>;
}