import React, { useEffect, useState } from 'react';
import type {
    AdminSubscriptionPlanDto,
    BillingPeriod,
    SubscriptionEntitlement,
} from '../../types/admin-billing.types';
import {
    BILLING_PERIOD_OPTIONS,
    PLAN_FORM_LIMITS,
    SUBSCRIPTION_ENTITLEMENT_OPTIONS,
} from '../../constants/admin-billing.constants';
import {
    useCreateAdminPlanMutation,
    useUpdateAdminPlanMutation,
} from '../../api/admin-billing.api';
import { AdminModal } from '../../../../../shared/admin/components/admin-modal.component';
import { getErrorMessage } from '../../../../../shared/utils/error.util';
import styles from './plan-form-modal.module.css';

export interface PlanFormModalProps {
    isOpen: boolean;
    plan?: AdminSubscriptionPlanDto | null;
    onClose: () => void;
    onSuccess?: (savedPlan: AdminSubscriptionPlanDto) => void;
}

export const PlanFormModal: React.FC<PlanFormModalProps> = ({
    isOpen,
    plan,
    onClose,
    onSuccess,
}) => {
    const isEdit = Boolean(plan?.id);

    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('MONTHLY');
    const [amount, setAmount] = useState<number | ''>('');
    const [entitlements, setEntitlements] = useState<SubscriptionEntitlement[]>([]);
    const [sortOrder, setSortOrder] = useState<number>(1);
    const [isActive, setIsActive] = useState(true);

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [serverError, setServerError] = useState<string | null>(null);

    const [createPlan, { isLoading: isCreating }] = useCreateAdminPlanMutation();
    const [updatePlan, { isLoading: isUpdating }] = useUpdateAdminPlanMutation();

    const isSubmitting = isCreating || isUpdating;

    useEffect(() => {
        if (!isOpen) {
            setErrors({});
            setServerError(null);
            return;
        }

        if (plan) {
            setName(plan.name);
            setCode(plan.code);
            setBillingPeriod(plan.billingPeriod);
            setAmount(plan.price?.amount ?? 0);
            setEntitlements(plan.entitlements || []);
            setSortOrder(plan.sortOrder ?? 1);
            setIsActive(plan.isActive ?? true);
        } else {
            setName('');
            setCode('');
            setBillingPeriod('MONTHLY');
            setAmount('');
            setEntitlements(['SCENE_PARTNER_ACCESS']);
            setSortOrder(1);
            setIsActive(true);
        }
        setErrors({});
        setServerError(null);
    }, [isOpen, plan]);

    if (!isOpen) return null;

    const toggleEntitlement = (key: SubscriptionEntitlement) => {
        setEntitlements((prev) =>
            prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
        );
    };

    const validate = (): boolean => {
        const nextErrors: Record<string, string> = {};

        const trimmedName = name.trim();
        if (!trimmedName) {
            nextErrors.name = 'Plan name is required.';
        } else if (
            trimmedName.length < PLAN_FORM_LIMITS.NAME_MIN ||
            trimmedName.length > PLAN_FORM_LIMITS.NAME_MAX
        ) {
            nextErrors.name = `Name must be ${PLAN_FORM_LIMITS.NAME_MIN}-${PLAN_FORM_LIMITS.NAME_MAX} chars.`;
        }

        if (!isEdit) {
            const trimmedCode = code.trim();
            if (!trimmedCode) {
                nextErrors.code = 'Plan code is required.';
            } else if (
                trimmedCode.length < PLAN_FORM_LIMITS.CODE_MIN ||
                trimmedCode.length > PLAN_FORM_LIMITS.CODE_MAX
            ) {
                nextErrors.code = `Code must be ${PLAN_FORM_LIMITS.CODE_MIN}-${PLAN_FORM_LIMITS.CODE_MAX} chars.`;
            }
        }

        if (amount === '' || Number.isNaN(Number(amount)) || Number(amount) < 0) {
            nextErrors.amount = 'Valid non-negative price is required.';
        }

        if (entitlements.length === 0) {
            nextErrors.entitlements = 'Select at least one entitlement.';
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setServerError(null);

        if (!validate()) return;

        try {
            if (isEdit && plan) {
                const res = await updatePlan({
                    id: plan.id,
                    payload: {
                        name: name.trim(),
                        price: { amount: Number(amount), currency: 'INR' },
                        entitlements,
                        sortOrder: Number(sortOrder),
                        isActive,
                    },
                }).unwrap();

                if (res.data) {
                    onSuccess?.(res.data);
                }
                onClose();
            } else {
                const res = await createPlan({
                    name: name.trim(),
                    code: code.trim().toUpperCase(),
                    billingPeriod,
                    price: { amount: Number(amount), currency: 'INR' },
                    entitlements,
                    sortOrder: Number(sortOrder),
                    isActive,
                }).unwrap();

                if (res.data) {
                    onSuccess?.(res.data);
                }
                onClose();
            }
        } catch (err: unknown) {
            setServerError(getErrorMessage(err));
        }
    };

    return (
        <AdminModal
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? 'EDIT SUBSCRIPTION PLAN' : 'CREATE NEW PLAN'}
            subtitle={
                isEdit
                    ? `Update commercial parameters for ${plan?.code}`
                    : 'Configure tier parameters, price, and feature entitlements'
            }
            size="lg"
        >
            <form onSubmit={handleSubmit} className={styles.form}>
                {serverError && <div className={styles.errorBanner}>{serverError}</div>}

                <div className={styles.fieldRow}>
                    <div className={styles.fieldGroup}>
                        <div className={styles.labelRow}>
                            <label className={styles.label}>
                                Plan Name<span className={styles.required}>*</span>
                            </label>
                        </div>
                        <input
                            type="text"
                            className={styles.input}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Premium Plus"
                            disabled={isSubmitting}
                        />
                        {errors.name && <span className={styles.fieldError}>{errors.name}</span>}
                    </div>

                    <div className={styles.fieldGroup}>
                        <div className={styles.labelRow}>
                            <label className={styles.label}>
                                Plan Code<span className={styles.required}>*</span>
                            </label>
                        </div>
                        <input
                            type="text"
                            className={styles.input}
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            placeholder="e.g. PREMIUM_MONTHLY"
                            disabled={isEdit || isSubmitting}
                        />
                        {errors.code && <span className={styles.fieldError}>{errors.code}</span>}
                    </div>
                </div>

                <div className={styles.fieldRow}>
                    <div className={styles.fieldGroup}>
                        <div className={styles.labelRow}>
                            <label className={styles.label}>
                                Billing Period<span className={styles.required}>*</span>
                            </label>
                        </div>
                        <select
                            className={styles.select}
                            value={billingPeriod}
                            onChange={(e) => setBillingPeriod(e.target.value as BillingPeriod)}
                            disabled={isEdit || isSubmitting}
                        >
                            {BILLING_PERIOD_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.fieldGroup}>
                        <div className={styles.labelRow}>
                            <label className={styles.label}>
                                Price (₹ INR)<span className={styles.required}>*</span>
                            </label>
                        </div>
                        <input
                            type="number"
                            min="0"
                            step="1"
                            className={styles.input}
                            value={amount}
                            onChange={(e) =>
                                setAmount(e.target.value === '' ? '' : Number(e.target.value))
                            }
                            placeholder="999"
                            disabled={isSubmitting}
                        />
                        {errors.amount && <span className={styles.fieldError}>{errors.amount}</span>}
                    </div>
                </div>

                <div className={styles.fieldGroup}>
                    <div className={styles.labelRow}>
                        <label className={styles.label}>
                            Feature Entitlements<span className={styles.required}>*</span>
                        </label>
                    </div>
                    <div className={styles.checkboxGroup}>
                        {SUBSCRIPTION_ENTITLEMENT_OPTIONS.map((opt) => {
                            const isChecked = entitlements.includes(
                                opt.key as SubscriptionEntitlement
                            );
                            return (
                                <label
                                    key={opt.key}
                                    className={`${styles.checkboxItem} ${
                                        isChecked ? styles.checkboxItemActive : ''
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        className={styles.checkbox}
                                        checked={isChecked}
                                        onChange={() =>
                                            toggleEntitlement(opt.key as SubscriptionEntitlement)
                                        }
                                        disabled={isSubmitting}
                                    />
                                    <div className={styles.checkboxText}>
                                        <span className={styles.checkboxLabel}>{opt.label}</span>
                                        <span className={styles.checkboxDesc}>{opt.description}</span>
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                    {errors.entitlements && (
                        <span className={styles.fieldError}>{errors.entitlements}</span>
                    )}
                </div>

                <div className={styles.fieldRow}>
                    <div className={styles.fieldGroup}>
                        <div className={styles.labelRow}>
                            <label className={styles.label}>Sort Order</label>
                        </div>
                        <input
                            type="number"
                            className={styles.input}
                            value={sortOrder}
                            onChange={(e) => setSortOrder(Number(e.target.value))}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className={styles.fieldGroup}>
                        <div className={styles.labelRow}>
                            <label className={styles.label}>Plan Availability</label>
                        </div>
                        <div className={styles.toggleRow}>
                            <input
                                type="checkbox"
                                id="plan-is-active"
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                                className={styles.checkbox}
                                disabled={isSubmitting}
                            />
                            <label htmlFor="plan-is-active" className={styles.toggleLabel}>
                                {isActive ? 'ACTIVE (Available to Users)' : 'INACTIVE (Archived)'}
                            </label>
                        </div>
                    </div>
                </div>

                <div className={styles.footer}>
                    <button
                        type="button"
                        className={styles.cancelBtn}
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? 'Saving...'
                            : isEdit
                            ? 'Update Plan'
                            : 'Create Plan'}
                    </button>
                </div>
            </form>
        </AdminModal>
    );
};
