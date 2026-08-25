import { Injectable, Logger } from "@nestjs/common";
import * as nodemailer from 'nodemailer'
import { IEmailService } from "../../domain/interfaces/email-service.interface";

@Injectable()
export class NodeMailerEmailService implements IEmailService{
    private transporter: nodemailer.Transporter;
    private readonly logger = new Logger(NodeMailerEmailService.name);

    constructor(){
        // In Production, these should be pulled from a ConfigService or process.env
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587', 10),
            secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
            auth:{
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            }
        })
    }

    async sendOtpEmail(to: string, otp: string): Promise<void> {
        const htmlTemplate = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 480px; margin: 40px auto; color: #1a1a1a;">
                <h2 style="font-weight: 600; font-size: 24px; margin-bottom: 24px;">Verify your email</h2>
                <p style="font-size: 16px; line-height: 1.5; margin-bottom: 32px;">
                Enter the following 6-digit code to verify your MERGE account. This code will expire in 10 minutes.
                </p>
                <div style="background-color: #f4f4f5; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 32px;">
                <span style="font-size: 32px; font-weight: 700; letter-spacing: 4px; color: #000;">${otp}</span>
                </div>
                <p style="font-size: 14px; color: #71717a;">
                If you didn't request this code, you can safely ignore this email.
                </p>
            </div>
        `;

        const mailOptions = {
            from: `"MERGE" <${process.env.SMTP_FROM || 'noreply@merge.com'}>`,
            to,
            subject: 'Your MERGE Verification Code',
            html: htmlTemplate,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            this.logger.log(`OTP email send successfully to ${to}`);
        } catch (error: any) {
            this.logger.error(`Failed to send OTP email to ${to}`, error.stack);
            throw new Error('Falied to dispatch verification email. Please try again later.')
        }
    }
}