import { Injectable, Logger } from "@nestjs/common";
import * as nodemailer from 'nodemailer';
import { IEmailService } from "../../domain/interfaces/email-service.interface";
import { ErrorCode } from "../../domain/enums/error-code.enum";
import { DomainException } from "../../domain/exceptions/domain.exception";
import { EnvConfig } from "../config/env.config";
import { EmailRenderOutput, EmailTemplates } from "./templates/email.templates";

@Injectable()
export class NodeMailerEmailService implements IEmailService {
    private readonly _transporter: nodemailer.Transporter;
    private readonly _logger = new Logger(NodeMailerEmailService.name);

    constructor() {
        this._transporter = nodemailer.createTransport({
            host: EnvConfig.smtp.host,
            port: EnvConfig.smtp.port,
            secure: EnvConfig.smtp.secure,
            auth: {
                user: EnvConfig.smtp.user,
                pass: EnvConfig.smtp.pass,
            },
        });
    }

    private async _sendEmail(
        to: string,
        output: EmailRenderOutput,
        errorMessageOnFailure?: string
    ): Promise<void> {
        try {
            await this._transporter.sendMail({
                from: `"${output.fromName}" <${EnvConfig.smtp.from}>`,
                to,
                subject: output.subject,
                html: output.html,
            });
            this._logger.log(`Email dispatched successfully to ${to} [${output.subject}]`);
        } catch (error: unknown) {
            const errorStack = error instanceof Error ? error.stack : undefined;
            this._logger.error(`Failed to dispatch email to ${to} [${output.subject}]`, errorStack);
            if (errorMessageOnFailure) {
                throw new DomainException(ErrorCode.INTERNAL_SERVER_ERROR, errorMessageOnFailure);
            }
        }
    }

    async sendOtpEmail(to: string, otp: string): Promise<void> {
        await this._sendEmail(
            to,
            EmailTemplates.userOtp(otp),
            'Failed to dispatch verification email. Please try again later.'
        );
    }

    async sendAdminResetOtpEmail(to: string, otp: string): Promise<void> {
        await this._sendEmail(
            to,
            EmailTemplates.adminResetOtp(otp),
            'Failed to dispatch administrative security email.'
        );
    }

    async sendBanNotificationEmail(to: string, reason: string): Promise<void> {
        await this._sendEmail(to, EmailTemplates.banNotification(reason));
    }

    async sendSuspensionNotificationEmail(to: string, reason: string, until: Date): Promise<void> {
        await this._sendEmail(to, EmailTemplates.suspensionNotification(reason, until));
    }

    async sendAdminInviteEmail(to: string, token: string, inviterName: string): Promise<void> {
        await this._sendEmail(
            to,
            EmailTemplates.adminInvite(token, inviterName),
            'Failed to dispatch administrative invite email.'
        );
    }
}
