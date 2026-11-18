import { BillingPeriod } from '../enums/billing.enums';

export const BILLING_NAME_REGEX = /^[a-zA-Z\s]+$/;

export class BillingNormalizationUtil {
    public static normalizeName(rawName: string): string {
        if (!rawName) return '';
        return rawName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    }

    public static isValidNameFormat(rawName: string): boolean {
        if (!rawName) return false;
        const trimmed = rawName.trim();
        return trimmed.length > 0 && BILLING_NAME_REGEX.test(trimmed);
    }

    public static slugify(text: string): string {
        if (!text) return '';
        return text
            .trim()
            .replace(/[^a-zA-Z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '')
            .toUpperCase();
    }

    public static generatePlanCode(name: string, billingPeriod: BillingPeriod | string): string {
        const period = (billingPeriod ?? BillingPeriod.MONTHLY).toString().toUpperCase();
        const cleanName = this.slugify(name);
        if (!cleanName) {
            return `PLAN_${period}`;
        }

        // Avoid duplicate period prefix if the user typed "Monthly VIP" with billingPeriod "MONTHLY"
        let strippedName = cleanName;
        if (cleanName.startsWith(`${period}_`)) {
            strippedName = cleanName.slice(period.length + 1);
        } else if (cleanName === period) {
            strippedName = 'BASE';
        }

        return `PLAN_${period}_${strippedName}`;
    }

    public static generateCreditPackCode(name: string, creditsCount: number): string {
        const cleanName = this.slugify(name);
        const count = Math.max(1, Math.round(Number(creditsCount) || 1));

        if (!cleanName) {
            return `CREDIT_PACK_${count}`;
        }

        // Avoid duplicate count suffix if the user typed "Pack 10" with creditsCount 10
        if (cleanName.endsWith(`_${count}`)) {
            return `CREDIT_${cleanName}`;
        }

        return `CREDIT_${cleanName}_${count}`;
    }
}
