import React, { useEffect, useState } from 'react';
import type { AdminCreditPackDto } from '../../types/admin-billing.types';
import { CREDIT_PACK_FORM_LIMITS } from '../../constants/admin-billing.constants';
import {
    useCreateAdminCreditPackMutation,
    useUpdateAdminCreditPackMutation,
} from '../../api/admin-billing.api';
import { AdminModal } from '../../../../../shared/admin/components/admin-modal.component';
import { getErrorMessage } from '../../../../../shared/utils/error.util';
import styles from './credit-pack-form-modal.module.css';

export interface CreditPackFormModalProps {
    isOpen: boolean;
    pack?: AdminCreditPackDto | null;
    onClose: () => void;
    onSuccess?: (savedPack: AdminCreditPackDto) => void;
}

export const CreditPackFormModal: React.FC<CreditPackFormModalProps> = ({
    isOpen,
    pack,
    onClose,
    onSuccess,
}) => {
    const isEdit = Boolean(pack?.id);

    const [name, setName] = useState('');
    const [code, setCode] = useState('');
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
            return;
        }

        if (pack) {
            setName(pack.name);
            setCode(pack.code);
            setCreditsCount(pack.creditsCount);
            setAmount(pack.price?.amount ?? 0);
            setBadge(pack.badge || '');
            setSortOrder(pack.sortOrder ?? 1);
            setIsListed(pack.isListed ?? true);
            setIsActive(pack.isActive ?? true);
        } else {
            setName('');
            setCode('');
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

    const validate = (): boolean => {
        const nextErrors: Record<string, string> = {};

        const trimmedName = name.trim();
        if (!trimmedName) {
            nextErrors.name = 'Package name is required.';
        } else if (
            trimmedName.length < CREDIT_PACK_FORM_LIMITS.NAME_MIN ||
            trimmedName.length > CREDIT_PACK_FORM_LIMITS.NAME_MAX
        ) {
            nextErrors.name = `Name must be ${CREDIT_PACK_FORM_LIMITS.NAME_MIN}-${CREDIT_PACK_FORM_LIMITS.NAME_MAX} chars.`;
        }

        if (!isEdit) {
            const trimmedCode = code.trim();
            if (!trimmedCode) {
                nextErrors.code = 'Package code is required.';
            } else if (
                trimmedCode.length < CREDIT_PACK_FORM_LIMITS.CODE_MIN ||
                trimmedCode.length > CREDIT_PACK_FORM_LIMITS.CODE_MAX
            ) {
                nextErrors.code = `Code must be ${CREDIT_PACK_FORM_LIMITS.CODE_MIN}-${CREDIT_PACK_FORM_LIMITS.CODE_MAX} chars.`;
            }
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
            setServerError(getErrorMessage(err));
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
                            className={styles.input}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
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
                        </div>
                        <input
                            type="text"
                            className={styles.input}
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            placeholder="e.g. CREDIT_PACK_10"
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
                            className={styles.input}
                            value={creditsCount}
                            onChange={(e) =>
                                setCreditsCount(
                                    e.target.value === '' ? '' : Number(e.target.value)
                                )
                            }
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
                            className={styles.input}
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
