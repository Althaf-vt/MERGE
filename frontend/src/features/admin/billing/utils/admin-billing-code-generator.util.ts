import type { BillingPeriod } from '../types/admin-billing.types';

export class BillingNormalizationUtil {
    
    public static normalizeName(text: string): string {
        if (!text) return '';
        return text.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    }

    public static slugify(text: string): string {
        return text
            .trim()
            .replace(/[^a-zA-Z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '')
            .toUpperCase();
    }

    public static generatePlanCode(name: string, billingPeriod: BillingPeriod | string): string {
        const period = (billingPeriod ?? 'MONTHLY').toString().toUpperCase();
        const cleanName = this.slugify(name);
        if (!cleanName) return '';

        // Avoid duplicate period prefix if the name contains the period (e.g. "Monthly VIP")
        let strippedName = cleanName;
        if (cleanName.startsWith(`${period}_`)) {
            strippedName = cleanName.slice(period.length + 1);
        } else if (cleanName === period) {
            strippedName = 'BASE';
        }

        return `PLAN_${period}_${strippedName}`;
    }

    public static generateCreditPackCode(name: string, creditsCount: number | ''): string {
        const cleanName = this.slugify(name);
        if (!cleanName) return '';

        const count = typeof creditsCount === 'number' && creditsCount > 0 ? Math.round(creditsCount) : 0;
        if (count > 0) {
            // Avoid duplicate count suffix if user typed "Pack 10" with 10 credits
            if (cleanName.endsWith(`_${count}`)) {
                return `CREDIT_${cleanName}`;
            }
            return `CREDIT_${cleanName}_${count}`;
        }

        return `CREDIT_${cleanName}`;
    }
}
