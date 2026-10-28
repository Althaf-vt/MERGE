import { EnvConfig } from '../../config/env.config';

export interface EmailRenderOutput {
    fromName: string;
    subject: string;
    html: string;
}

export const EmailTemplates = {
    userOtp(otp: string): EmailRenderOutput {
        const appName = EnvConfig.app.name;
        return {
            fromName: appName,
            subject: `Your ${appName} Verification Code`,
            html: `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 480px; margin: 40px auto; color: #1a1a1a;">
    <h2 style="font-weight: 600; font-size: 24px; margin-bottom: 24px;">Verify your email</h2>
    <p style="font-size: 16px; line-height: 1.5; margin-bottom: 32px;">
    Enter the following 6-digit code to verify your ${appName} account. This code will expire in 10 minutes.
    </p>
    <div style="background-color: #f4f4f5; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 32px;">
    <span style="font-size: 32px; font-weight: 700; letter-spacing: 4px; color: #000;">${otp}</span>
    </div>
    <p style="font-size: 14px; color: #71717a;">
    If you didn't request this code, you can safely ignore this email.
    </p>
</div>
            `.trim(),
        };
    },

    adminResetOtp(otp: string): EmailRenderOutput {
        const appName = EnvConfig.app.name;
        return {
            fromName: `${appName} Security`,
            subject: `${appName} Admin Portal - Password Reset Code`,
            html: `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 40px auto; color: #1a1a1a; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
    <div style="background-color: #0a0a0a; padding: 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 18px; letter-spacing: 1px;">${appName} <span style="color: #d8b4fe;">ADMIN PORTAL</span></h1>
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
            `.trim(),
        };
    },

    banNotification(reason: string): EmailRenderOutput {
        const appName = EnvConfig.app.name;
        return {
            fromName: `${appName} Trust & Safety`,
            subject: `Important Notice Regarding Your ${appName} Account`,
            html: `
<div style="font-family: sans-serif; max-width: 480px; margin: 40px auto; color: #1a1a1a;">
    <h2 style="color: #dc2626; font-size: 24px; margin-bottom: 24px;">Account Banned</h2>
    <p style="font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
        Your ${appName} account has been permanently banned due to a violation of our community guidelines.
    </p>
    <div style="background-color: #fee2e2; border-left: 4px solid #dc2626; padding: 16px; margin-bottom: 24px;">
        <strong>Reason:</strong> ${reason}
    </div>
    <p style="font-size: 14px; color: #71717a;">
        If you believe this is an error, please contact support.
    </p>
</div>
            `.trim(),
        };
    },

    suspensionNotification(reason: string, until: Date): EmailRenderOutput {
        const appName = EnvConfig.app.name;
        return {
            fromName: `${appName} Trust & Safety`,
            subject: 'Notice of Temporary Account Suspension',
            html: `
<div style="font-family: sans-serif; max-width: 480px; margin: 40px auto; color: #1a1a1a;">
    <h2 style="color: #ea580c; font-size: 24px; margin-bottom: 24px;">Account Temporarily Suspended</h2>
    <p style="font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
        Your ${appName} account has been temporarily suspended. You will regain access on <strong>${until.toUTCString()}</strong>.
    </p>
    <div style="background-color: #ffedd5; border-left: 4px solid #ea580c; padding: 16px; margin-bottom: 24px;">
        <strong>Reason:</strong> ${reason}
    </div>
    <p style="font-size: 14px; color: #71717a;">
        Please ensure you adhere to our guidelines going forward to avoid permanent account restrictions.
    </p>
</div>
            `.trim(),
        };
    },

    adminInvite(token: string, inviterName: string): EmailRenderOutput {
        const appName = EnvConfig.app.name;
        const inviteUrl = `${EnvConfig.app.frontendUrl}/admin/accept-invite?token=${token}`;
        return {
            fromName: `${appName} Security`,
            subject: `${appName} Admin Portal - Secure Invitation`,
            html: `
<div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 40px auto; color: #1a1a1a; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
    <div style="background-color: #0a0a0a; padding: 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 18px; letter-spacing: 1px;">${appName} <span style="color: #d8b4fe;">ADMIN PORTAL</span></h1>
    </div>
    <div style="padding: 32px;">
        <h2 style="font-weight: 600; font-size: 20px; margin-top: 0; margin-bottom: 24px;">Administrative Invitation</h2>
        <p style="font-size: 15px; line-height: 1.6; margin-bottom: 24px; color: #3f3f46;">
            You have been invited by <strong>${inviterName}</strong> to join the ${appName} administrative team. 
            Please click the secure link below to set up your password and access the system.
        </p>
        <div style="text-align: center; margin-bottom: 32px;">
            <a href="${inviteUrl}" style="display: inline-block; background-color: #6D28D9; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">Accept Invitation</a>
        </div>
        <p style="font-size: 13px; color: #71717a; line-height: 1.5; margin: 0;">
            <strong>Security Note:</strong> This link is strictly confidential and will automatically expire in 24 hours.
        </p>
    </div>
</div>
            `.trim(),
        };
    },
};

