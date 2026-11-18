import React, { useEffect, useState } from 'react';
import type { AdminCreditPackDto } from '../../types/admin-billing.types';
import { CREDIT_PACK_FORM_LIMITS } from '../../constants/admin-billing.constants';
import {
    useCreateAdminCreditPackMutation,
    useUpdateAdminCreditPackMutation,
} from '../../api/admin-billing.api';
import { AdminModal } from '../../../../../shared/admin/components/admin-modal.component';
import { getErrorMessage } from '../../../../../shared/utils/error.util';
import { BillingNormalizationUtil } from '../../utils/admin-billing-code-generator.util';
import { AdminBillingValidationUtil } from '../../utils/admin-billing-validation.util';
import styles from './credit-pack-form-modal.module.css';

export interface CreditPackFormModalProps {
    isOpen: boolean;
    pack?: AdminCreditPackDto | null;
    existingPacks?: AdminCreditPackDto[];
    onClose: () => void;
    onSuccess?: (savedPack: AdminCreditPackDto) => void;
}

export const CreditPackFormModal: React.FC<CreditPackFormModalProps> = ({
    isOpen,
    pack,
    existingPacks = [],
    onClose,
    onSuccess,
}) => {
    const isEdit = Boolean(pack?.id);

    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [isCodeManuallyEdited, setIsCodeManuallyEdited] = useState(false);
    const [creditsCount, setCreditsCount] = useState<number | ''>('');
    const [amount, setAmount] = useState<number | ''>('');
    const [badge, setBadge] = useState('');
    const [sortOrder, setSortOrder] = useState<number>(1);
    const [isListed, setIsListed] = useState(true);
    const [isActive, setIsActive] = useState(true);

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [serverError, setServerError] = useState<string | null>(null);

    const [createPack, { isLoading: isCreating }] = useCreateAdminCreditPackMutation();
    const [updatePack, { isLoading: isUpdating }] = useUpdateAdminCreditPackMutation();

    const isSubmitting = isCreating || isUpdating;

    useEffect(() => {
        if (!isOpen) {
            setErrors({});
            setServerError(null);
            setIsCodeManuallyEdited(false);
            return;
        }

        if (pack) {
            setName(pack.name);
            setCode(pack.code);
            setIsCodeManuallyEdited(true); // Edit mode preserves existing code
            setCreditsCount(pack.creditsCount);
            setAmount(pack.price?.amount ?? 0);
            setBadge(pack.badge || '');
            setSortOrder(pack.sortOrder ?? 1);
            setIsListed(pack.isListed ?? true);
            setIsActive(pack.isActive ?? true);
        } else {
            setName('');
            setCode('');
            setIsCodeManuallyEdited(false);
            setCreditsCount('');
            setAmount('');
            setBadge('');
            setSortOrder(1);
            setIsListed(true);
            setIsActive(true);
        }
        setErrors({});
        setServerError(null);
    }, [isOpen, pack]);

    if (!isOpen) return null;

    // Live name change handler with instant validation and code autofill
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        setName(newName);

        if (serverError) setServerError(null);

        const nameError = AdminBillingValidationUtil.validateCreditPackName(
            newName,
            existingPacks,
            pack?.id,
        );
        setErrors((prev) => ({ ...prev, name: nameError || '' }));

        if (!isEdit && !isCodeManuallyEdited) {
            const autoCode = BillingNormalizationUtil.generateCreditPackCode(newName, creditsCount);
            setCode(autoCode);
            setErrors((prev) => ({ ...prev, code: '' }));
        }
    };

    // Live credits count change handler (re-generates code if in auto mode)
    const handleCreditsCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value === '' ? '' : Number(e.target.value);
        setCreditsCount(val);

        if (!isEdit && !isCodeManuallyEdited) {
            const autoCode = BillingNormalizationUtil.generateCreditPackCode(name, val);
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
            existingPacks,
            pack?.id,
            CREDIT_PACK_FORM_LIMITS,
        );
        setErrors((prev) => ({ ...prev, code: codeError || '' }));
    };

    // Reset code to auto-generated slug
    const handleResetCodeToAuto = () => {
        setIsCodeManuallyEdited(false);
        const autoCode = BillingNormalizationUtil.generateCreditPackCode(name, creditsCount);
        setCode(autoCode);
        setErrors((prev) => ({ ...prev, code: '' }));
    };

    const validate = (): boolean => {
        const nextErrors: Record<string, string> = {};

        const nameError = AdminBillingValidationUtil.validateCreditPackName(
            name,
            existingPacks,
            pack?.id,
        );
        if (nameError) nextErrors.name = nameError;

        if (!isEdit) {
            const codeError = AdminBillingValidationUtil.validateCode(
                code,
                existingPacks,
                pack?.id,
                CREDIT_PACK_FORM_LIMITS,
            );
            if (codeError) nextErrors.code = codeError;
        }

        const creditsNum = Number(creditsCount);
        if (
            creditsCount === '' ||
            Number.isNaN(creditsNum) ||
            creditsNum < CREDIT_PACK_FORM_LIMITS.MIN_CREDITS
        ) {
            nextErrors.creditsCount = `Credits must be at least ${CREDIT_PACK_FORM_LIMITS.MIN_CREDITS}.`;
        }

        const amountNum = Number(amount);
        if (amount === '' || Number.isNaN(amountNum) || amountNum < CREDIT_PACK_FORM_LIMITS.MIN_PRICE) {
            nextErrors.amount = `Price must be at least ₹${CREDIT_PACK_FORM_LIMITS.MIN_PRICE}.`;
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setServerError(null);

        if (!validate()) return;

        try {
            if (isEdit && pack) {
                const res = await updatePack({
                    id: pack.id,
                    payload: {
                        name: name.trim(),
                        creditsCount: Number(creditsCount),
                        price: { amount: Number(amount), currency: 'INR' },
                        badge: badge.trim() || undefined,
                        sortOrder: Number(sortOrder),
                        isListed,
                        isActive,
                    },
                }).unwrap();

                if (res.data) {
                    onSuccess?.(res.data);
                }
                onClose();
            } else {
                const res = await createPack({
                    name: name.trim(),
                    code: code.trim().toUpperCase(),
                    creditsCount: Number(creditsCount),
                    price: { amount: Number(amount), currency: 'INR' },
                    badge: badge.trim() || undefined,
                    sortOrder: Number(sortOrder),
                    isListed,
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
            } else if (msg.toLowerCase().includes('code already exists') || msg.toLowerCase().includes('credit pack code')) {
                setErrors((prev) => ({ ...prev, code: msg }));
            }
        }
    };

    return (
        <AdminModal
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? 'EDIT CREDIT PACKAGE' : 'CREATE CREDIT PACKAGE'}
            subtitle={
                isEdit
                    ? `Update attributes for ${pack?.code}`
                    : 'Define volume attributes, pricing, and store display parameters'
            }
            size="md"
        >
            <form onSubmit={handleSubmit} className={styles.form}>
                {serverError && <div className={styles.errorBanner}>{serverError}</div>}

                <div className={styles.fieldRow}>
                    <div className={styles.fieldGroup}>
                        <div className={styles.labelRow}>
                            <label className={styles.label}>
                                Package Name<span className={styles.required}>*</span>
                            </label>
                        </div>
                        <input
                            type="text"
                            className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                            value={name}
                            onChange={handleNameChange}
                            placeholder="e.g. Starter Pack"
                            disabled={isSubmitting}
                        />
                        {errors.name && <span className={styles.fieldError}>{errors.name}</span>}
                    </div>

                    <div className={styles.fieldGroup}>
                        <div className={styles.labelRow}>
                            <label className={styles.label}>
                                Package Code<span className={styles.required}>*</span>
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
                            placeholder="e.g. CREDIT_STARTER_PACK_10"
                            disabled={isEdit || isSubmitting}
                        />
                        {errors.code && <span className={styles.fieldError}>{errors.code}</span>}
                    </div>
                </div>

                <div className={styles.fieldRow}>
                    <div className={styles.fieldGroup}>
                        <div className={styles.labelRow}>
                            <label className={styles.label}>
                                Credits Count<span className={styles.required}>*</span>
                            </label>
                        </div>
                        <input
                            type="number"
                            min="1"
                            step="1"
                            className={`${styles.input} ${errors.creditsCount ? styles.inputError : ''}`}
                            value={creditsCount}
                            onChange={handleCreditsCountChange}
                            placeholder="10"
                            disabled={isSubmitting}
                        />
                        {errors.creditsCount && (
                            <span className={styles.fieldError}>{errors.creditsCount}</span>
                        )}
                    </div>

                    <div className={styles.fieldGroup}>
                        <div className={styles.labelRow}>
                            <label className={styles.label}>
                                Price (₹ INR)<span className={styles.required}>*</span>
                            </label>
                        </div>
                        <input
                            type="number"
                            min="1"
                            step="1"
                            className={`${styles.input} ${errors.amount ? styles.inputError : ''}`}
                            value={amount}
                            onChange={(e) =>
                                setAmount(e.target.value === '' ? '' : Number(e.target.value))
                            }
                            placeholder="249"
                            disabled={isSubmitting}
                        />
                        {errors.amount && <span className={styles.fieldError}>{errors.amount}</span>}
                    </div>
                </div>

                <div className={styles.fieldRow}>
                    <div className={styles.fieldGroup}>
                        <div className={styles.labelRow}>
                            <label className={styles.label}>Marketing Badge</label>
                        </div>
                        <input
                            type="text"
                            className={styles.input}
                            value={badge}
                            onChange={(e) => setBadge(e.target.value)}
                            placeholder="e.g. MOST POPULAR"
                            disabled={isSubmitting}
                        />
                        <span className={styles.helpText}>Optional ribbon tag shown in user store.</span>
                    </div>

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
                </div>

                <div className={styles.switchesContainer}>
                    <div className={styles.switchRow}>
                        <input
                            type="checkbox"
                            id="pack-is-listed"
                            checked={isListed}
                            onChange={(e) => setIsListed(e.target.checked)}
                            className={styles.checkbox}
                            disabled={isSubmitting}
                        />
                        <label htmlFor="pack-is-listed" className={styles.switchLabel}>
                            LISTED IN STORE CATALOG (Visible to Users)
                        </label>
                    </div>

                    <div className={styles.switchRow}>
                        <input
                            type="checkbox"
                            id="pack-is-active"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            className={styles.checkbox}
                            disabled={isSubmitting}
                        />
                        <label htmlFor="pack-is-active" className={styles.switchLabel}>
                            ACTIVE STATUS (Purchasable / Enabled)
                        </label>
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
                            ? 'Update Package'
                            : 'Create Package'}
                    </button>
                </div>
            </form>
        </AdminModal>
    );
};
