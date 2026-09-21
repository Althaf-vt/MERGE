import { Injectable, Logger } from "@nestjs/common";
import * as nodemailer from 'nodemailer'
import { IEmailService } from "../../domain/interfaces/email-service.interface";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";

@Injectable()
export class NodeMailerEmailService implements IEmailService {
    private _transporter: nodemailer.Transporter;
    private readonly _logger = new Logger(NodeMailerEmailService.name);

    constructor() {
        this._transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587', 10),
            secure: process.env.SMTP_SECURE === 'true', 
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            }
        });
    }

    // Standard User OTP Template
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
            await this._transporter.sendMail(mailOptions);
            this._logger.log(`User OTP email sent successfully to ${to}`);
        } catch (error: any) {
            this._logger.error(`Failed to send User OTP email to ${to}`, error.stack);
            throw new DomainException(ErrorCode.INTERNAL_SERVER_ERROR, 'Failed to dispatch verification email. Please try again later.');
        }
    }

    // Admin Password Reset Template
    async sendAdminResetOtpEmail(to: string, otp: string): Promise<void> {
        const htmlTemplate = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 40px auto; color: #1a1a1a; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #0a0a0a; padding: 20px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 18px; letter-spacing: 1px;">MERGE <span style="color: #d8b4fe;">ADMIN PORTAL</span></h1>
                </div>
                <div style="padding: 32px;">
                    <h2 style="font-weight: 600; font-size: 20px; margin-top: 0; margin-bottom: 24px;">Administrative Access Request</h2>
                    <p style="font-size: 15px; line-height: 1.6; margin-bottom: 24px; color: #3f3f46;">
                        A password reset was requested for your administrative account. Use the secure authorization code below to proceed. This code expires in 10 minutes.
                    </p>
                    <div style="background-color: #f4f4f5; border-radius: 6px; padding: 20px; text-align: center; margin-bottom: 24px;">
                        <span style="font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #000;">${otp}</span>
                    </div>
                    <p style="font-size: 13px; color: #71717a; line-height: 1.5; margin: 0;">
                        <strong>Security Alert:</strong> If you did not initiate this request, your credentials may be compromised. Please contact the Super Admin immediately.
                    </p>
                </div>
            </div>
        `;

        const mailOptions = {
            from: `"MERGE Security" <${process.env.SMTP_FROM || 'security@merge.com'}>`,
            to,
            subject: 'MERGE Admin Portal - Password Reset Code',
            html: htmlTemplate,
        };

        try {
            await this._transporter.sendMail(mailOptions);
            this._logger.log(`Admin Password Reset email sent successfully to ${to}`);
        } catch (error: any) {
            this._logger.error(`Failed to send Admin Password Reset email to ${to}`, error.stack);
            throw new DomainException(ErrorCode.INTERNAL_SERVER_ERROR, 'Failed to dispatch administrative security email.');
        }
    }

    async sendBanNotificationEmail(to: string, reason: string): Promise<void> {
        const htmlTemplate = `
            <div style="font-family: sans-serif; max-width: 480px; margin: 40px auto; color: #1a1a1a;">
                <h2 style="color: #dc2626; font-size: 24px; margin-bottom: 24px;">Account Banned</h2>
                <p style="font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
                    Your MERGE account has been permanently banned due to a violation of our community guidelines.
                </p>
                <div style="background-color: #fee2e2; border-left: 4px solid #dc2626; padding: 16px; margin-bottom: 24px;">
                    <strong>Reason:</strong> ${reason}
                </div>
                <p style="font-size: 14px; color: #71717a;">
                    If you believe this is an error, please contact support.
                </p>
            </div>
        `;

        try {
            await this._transporter.sendMail({
                from: `"MERGE Trust & Safety" <${process.env.SMTP_FROM || 'safety@merge.com'}>`,
                to,
                subject: 'Important Notice Regarding Your MERGE Account',
                html: htmlTemplate,
            });
            this._logger.log(`Ban notification sent to ${to}`);
        } catch (error: any) {
            this._logger.error(`Failed to send ban notification to ${to}`, error.stack);
        }
    }

    async sendSuspensionNotificationEmail(to: string, reason: string, until: Date): Promise<void> {
        const htmlTemplate = `
            <div style="font-family: sans-serif; max-width: 480px; margin: 40px auto; color: #1a1a1a;">
                <h2 style="color: #ea580c; font-size: 24px; margin-bottom: 24px;">Account Temporarily Suspended</h2>
                <p style="font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
                    Your MERGE account has been temporarily suspended. You will regain access on <strong>${until.toUTCString()}</strong>.
                </p>
                <div style="background-color: #ffedd5; border-left: 4px solid #ea580c; padding: 16px; margin-bottom: 24px;">
                    <strong>Reason:</strong> ${reason}
                </div>
                <p style="font-size: 14px; color: #71717a;">
                    Please ensure you adhere to our guidelines going forward to avoid permanent account restrictions.
                </p>
            </div>
        `;

        try {
            await this._transporter.sendMail({
                from: `"MERGE Trust & Safety" <${process.env.SMTP_FROM || 'safety@merge.com'}>`,
                to,
                subject: 'Notice of Temporary Account Suspension',
                html: htmlTemplate,
            });
            this._logger.log(`Suspension notification sent to ${to}`);
        } catch (error: any) {
            this._logger.error(`Failed to send suspension notification to ${to}`, error.stack);
        }
    }
}