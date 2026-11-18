import { PLAN_FORM_LIMITS, CREDIT_PACK_FORM_LIMITS } from '../constants/admin-billing.constants';
import { BillingNormalizationUtil } from './admin-billing-code-generator.util';

export const BILLING_NAME_REGEX = /^[a-zA-Z\s]+$/;
export const BILLING_CODE_REGEX = /^[A-Z0-9_]+$/;

export class AdminBillingValidationUtil {
    public static validatePlanName(
        name: string,
        billingPeriod: string,
        existingPlans: Array<{ id: string; name: string; billingPeriod: string }> = [],
        currentPlanId?: string,
    ): string | null {
        const trimmed = name.trim();
        if (!trimmed) {
            return 'Plan name is required.';
        }
        if (trimmed.length < PLAN_FORM_LIMITS.NAME_MIN || trimmed.length > PLAN_FORM_LIMITS.NAME_MAX) {
            return `Plan name must be between ${PLAN_FORM_LIMITS.NAME_MIN} and ${PLAN_FORM_LIMITS.NAME_MAX} characters.`;
        }
        if (!BILLING_NAME_REGEX.test(trimmed)) {
            return 'Plan name can only contain alphabetic letters and spaces.';
        }

        // Preemptive duplicate detection within the same billing period
        const normalized = BillingNormalizationUtil.normalizeName(trimmed);
        const duplicate = existingPlans.find(
            (p) =>
                p.id !== currentPlanId &&
                p.billingPeriod === billingPeriod &&
                BillingNormalizationUtil.normalizeName(p.name) === normalized,
        );

        if (duplicate) {
            return `A plan with this name already exists for ${billingPeriod.toLowerCase()} billing.`;
        }

        return null;
    }

    public static validateCreditPackName(
        name: string,
        existingPacks: Array<{ id: string; name: string }> = [],
        currentPackId?: string,
    ): string | null {
        const trimmed = name.trim();
        if (!trimmed) {
            return 'Credit pack name is required.';
        }
        if (trimmed.length < CREDIT_PACK_FORM_LIMITS.NAME_MIN || trimmed.length > CREDIT_PACK_FORM_LIMITS.NAME_MAX) {
            return `Credit pack name must be between ${CREDIT_PACK_FORM_LIMITS.NAME_MIN} and ${CREDIT_PACK_FORM_LIMITS.NAME_MAX} characters.`;
        }
        if (!BILLING_NAME_REGEX.test(trimmed)) {
            return 'Credit pack name can only contain alphabetic letters and spaces.';
        }

        // Preemptive duplicate detection across all credit packs
        const normalized = BillingNormalizationUtil.normalizeName(trimmed);
        const duplicate = existingPacks.find(
            (p) =>
                p.id !== currentPackId &&
                BillingNormalizationUtil.normalizeName(p.name) === normalized,
        );

        if (duplicate) {
            return 'A credit pack with this name already exists.';
        }

        return null;
    }

    public static validateCode(
        code: string,
        existingItems: Array<{ id: string; code: string }> = [],
        currentItemId?: string,
        limits: { CODE_MIN: number; CODE_MAX: number } = PLAN_FORM_LIMITS,
    ): string | null {
        const trimmed = code.trim().toUpperCase();
        if (!trimmed) {
            return 'Code is required.';
        }
        if (trimmed.length < limits.CODE_MIN || trimmed.length > limits.CODE_MAX) {
            return `Code must be between ${limits.CODE_MIN} and ${limits.CODE_MAX} characters.`;
        }
        if (!BILLING_CODE_REGEX.test(trimmed)) {
            return 'Code can only contain uppercase letters, numbers, and underscores.';
        }

        const duplicate = existingItems.find(
            (item) => item.id !== currentItemId && item.code.toUpperCase() === trimmed,
        );
        if (duplicate) {
            return 'This code is already assigned to another item.';
        }

        return null;
    }
}
