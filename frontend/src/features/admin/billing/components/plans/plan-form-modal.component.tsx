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
import { BillingNormalizationUtil } from '../../utils/admin-billing-code-generator.util';
import { AdminBillingValidationUtil } from '../../utils/admin-billing-validation.util';
import styles from './plan-form-modal.module.css';

export interface PlanFormModalProps {
    isOpen: boolean;
    plan?: AdminSubscriptionPlanDto | null;
    existingPlans?: AdminSubscriptionPlanDto[];
    onClose: () => void;
    onSuccess?: (savedPlan: AdminSubscriptionPlanDto) => void;
}

export const PlanFormModal: React.FC<PlanFormModalProps> = ({
    isOpen,
    plan,
    existingPlans = [],
    onClose,
    onSuccess,
}) => {
    const isEdit = Boolean(plan?.id);

    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [isCodeManuallyEdited, setIsCodeManuallyEdited] = useState(false);
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
            setIsCodeManuallyEdited(false);
            return;
        }

        if (plan) {
            setName(plan.name);
            setCode(plan.code);
            setIsCodeManuallyEdited(true); // Edit mode preserves existing code
            setBillingPeriod(plan.billingPeriod);
            setAmount(plan.price?.amount ?? 0);
            setEntitlements(plan.entitlements || []);
            setSortOrder(plan.sortOrder ?? 1);
            setIsActive(plan.isActive ?? true);
        } else {
            setName('');
            setCode('');
            setIsCodeManuallyEdited(false);
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

    // Live name change handler with instant validation and code autofill
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        setName(newName);

        if (serverError) setServerError(null);

        const nameError = AdminBillingValidationUtil.validatePlanName(
            newName,
            billingPeriod,
            existingPlans,
            plan?.id,
        );
        setErrors((prev) => ({ ...prev, name: nameError || '' }));

        if (!isEdit && !isCodeManuallyEdited) {
            const autoCode = BillingNormalizationUtil.generatePlanCode(newName, billingPeriod);
            setCode(autoCode);
            setErrors((prev) => ({ ...prev, code: '' }));
        }
    };

    // Live billing period change handler
    const handleBillingPeriodChange = (newPeriod: BillingPeriod) => {
        setBillingPeriod(newPeriod);

        const nameError = AdminBillingValidationUtil.validatePlanName(
            name,
            newPeriod,
            existingPlans,
            plan?.id,
        );
        setErrors((prev) => ({ ...prev, name: nameError || '' }));

        if (!isEdit && !isCodeManuallyEdited) {
            const autoCode = BillingNormalizationUtil.generatePlanCode(name, newPeriod);
            setCode(autoCode);
            setErrors((prev) => ({ ...prev, code: '' }));
        }
    };

    // Manual code change handler
    const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawCode = e.target.value.toUpperCase();
        setCode(rawCode);
        setIsCodeManuallyEdited(true);

        const codeError = AdminBillingValidationUtil.validateCode(
            rawCode,
            existingPlans,
            plan?.id,
            PLAN_FORM_LIMITS,
        );
        setErrors((prev) => ({ ...prev, code: codeError || '' }));
    };

    // Reset code to auto-generated slug
    const handleResetCodeToAuto = () => {
        setIsCodeManuallyEdited(false);
        const autoCode = BillingNormalizationUtil.generatePlanCode(name, billingPeriod);
        setCode(autoCode);
        setErrors((prev) => ({ ...prev, code: '' }));
    };

    const toggleEntitlement = (key: SubscriptionEntitlement) => {
        setEntitlements((prev) =>
            prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
        );
    };

    const validate = (): boolean => {
        const nextErrors: Record<string, string> = {};

        const nameError = AdminBillingValidationUtil.validatePlanName(
            name,
            billingPeriod,
            existingPlans,
            plan?.id,
        );
        if (nameError) nextErrors.name = nameError;

        if (!isEdit) {
            const codeError = AdminBillingValidationUtil.validateCode(
                code,
                existingPlans,
                plan?.id,
                PLAN_FORM_LIMITS,
            );
            if (codeError) nextErrors.code = codeError;
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
            const msg = getErrorMessage(err);
            setServerError(msg);

            // Server-side error mapping directly to field inputs
            if (msg.toLowerCase().includes('name already exists') || msg.toLowerCase().includes('alphabetic')) {
                setErrors((prev) => ({ ...prev, name: msg }));
            } else if (msg.toLowerCase().includes('code already exists') || msg.toLowerCase().includes('plan code')) {
                setErrors((prev) => ({ ...prev, code: msg }));
            }
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
                            className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                            value={name}
                            onChange={handleNameChange}
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
                            {!isEdit && (
                                <div className={styles.badgeWrapper}>
                                    <span className={isCodeManuallyEdited ? styles.manualBadge : styles.autoBadge}>
                                        {isCodeManuallyEdited ? 'CUSTOM' : 'AUTO'}
                                    </span>
                                    {isCodeManuallyEdited && (
                                        <button
                                            type="button"
                                            className={styles.resetButton}
                                            onClick={handleResetCodeToAuto}
                                            title="Revert to auto-generated slug"
                                        >
                                            Reset
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                        <input
                            type="text"
                            className={`${styles.input} ${errors.code ? styles.inputError : ''}`}
                            value={code}
                            onChange={handleCodeChange}
                            placeholder="e.g. PLAN_MONTHLY_PREMIUM_PLUS"
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
                            onChange={(e) => handleBillingPeriodChange(e.target.value as BillingPeriod)}
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
