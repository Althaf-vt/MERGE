import React, { useState, useEffect, useRef } from 'react';
import type { AdminPlanOfferDto, PlanOfferInputPayload } from '../../types/admin-billing.types';
import { OFFER_FORM_LIMITS } from '../../constants/admin-billing.constants';
import { getOfferStatus } from '../../utils/admin-billing-offers.util';
import { AdminModal } from '../../../../../shared/admin/components/admin-modal.component';
import { getErrorMessage } from '../../../../../shared/utils/error.util';
import styles from './promotional-offers-modal.module.css';

export interface PromotionalOffersModalItem {
    id: string;
    name: string;
    code: string;
    offers?: AdminPlanOfferDto[];
}

export interface PromotionalOffersModalProps {
    isOpen: boolean;
    item: PromotionalOffersModalItem | null;
    itemTypeLabel: 'Plan' | 'Credit Package';
    onClose: () => void;
    onUpdateOffers: (id: string, offers: PlanOfferInputPayload[]) => Promise<void>;
    isUpdating?: boolean;
}

export const PromotionalOffersModal: React.FC<PromotionalOffersModalProps> = ({
    isOpen,
    item,
    itemTypeLabel,
    onClose,
    onUpdateOffers,
    isUpdating = false,
}) => {
    const [campaignName, setCampaignName] = useState('');
    const [discountPercentage, setDiscountPercentage] = useState<number | ''>('');
    const [validFrom, setValidFrom] = useState('');
    const [validUntil, setValidUntil] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [confirmDeleteIndex, setConfirmDeleteIndex] = useState<number | null>(null);
    const [editingOfferId, setEditingOfferId] = useState<string | null>(null);

    const validFromInputRef = useRef<HTMLInputElement>(null);
    const validUntilInputRef = useRef<HTMLInputElement>(null);

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    useEffect(() => {
        setConfirmDeleteIndex(null);
        setEditingOfferId(null);
        if (!isOpen) {
            setError(null);
            setCampaignName('');
            setDiscountPercentage('');
            setValidFrom('');
            setValidUntil('');
        } else {
            setError(null);
        }
    }, [isOpen, item?.id]);

    const clearError = () => {
        if (error) setError(null);
    };

    const formatDateForInput = (d: string | Date | undefined): string => {
        if (!d) return '';
        try {
            const dateObj = new Date(d);
            if (isNaN(dateObj.getTime())) return '';
            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const day = String(dateObj.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        } catch {
            return '';
        }
    };

    const handleStartEdit = (offer: AdminPlanOfferDto) => {
        clearError();
        setConfirmDeleteIndex(null);
        setEditingOfferId(offer.id);
        setCampaignName(offer.name || offer.code || '');
        setDiscountPercentage(offer.discountPercentage);
        setValidFrom(formatDateForInput(offer.validFrom));
        setValidUntil(formatDateForInput(offer.validUntil));
    };

    const handleCancelEdit = () => {
        setEditingOfferId(null);
        setCampaignName('');
        setDiscountPercentage('');
        setValidFrom('');
        setValidUntil('');
        clearError();
    };

    if (!isOpen || !item) return null;

    const currentOffers: AdminPlanOfferDto[] = item.offers || [];

    const handleToggleOffer = async (index: number) => {
        try {
            setError(null);
            const updated: PlanOfferInputPayload[] = currentOffers.map((offer, idx) => ({
                id: offer.id,
                name: offer.name || offer.code || 'Promotional Offer',
                code: offer.code,
                discountPercentage: offer.discountPercentage,
                validFrom: typeof offer.validFrom === 'string' ? offer.validFrom : new Date(offer.validFrom).toISOString(),
                validUntil: typeof offer.validUntil === 'string' ? offer.validUntil : new Date(offer.validUntil).toISOString(),
                isActive: idx === index ? !offer.isActive : offer.isActive,
            }));

            await onUpdateOffers(item.id, updated);
        } catch (err: unknown) {
            setError(getErrorMessage(err));
        }
    };

    const handleDeleteOffer = async (index: number) => {
        try {
            setError(null);
            const updated: PlanOfferInputPayload[] = currentOffers
                .filter((_, idx) => idx !== index)
                .map((offer) => ({
                    id: offer.id,
                    name: offer.name || offer.code || 'Promotional Offer',
                    code: offer.code,
                    discountPercentage: offer.discountPercentage,
                    validFrom: typeof offer.validFrom === 'string' ? offer.validFrom : new Date(offer.validFrom).toISOString(),
                    validUntil: typeof offer.validUntil === 'string' ? offer.validUntil : new Date(offer.validUntil).toISOString(),
                    isActive: offer.isActive,
                }));

            await onUpdateOffers(item.id, updated);
        } catch (err: unknown) {
            setError(getErrorMessage(err));
        }
    };

    const handleSubmitOffer = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const trimmedName = campaignName.trim();
        if (!trimmedName) {
            setError('Campaign / offer name is required.');
            return;
        }

        if (
            trimmedName.length < OFFER_FORM_LIMITS.NAME_MIN ||
            trimmedName.length > OFFER_FORM_LIMITS.NAME_MAX
        ) {
            setError(
                `Campaign name must be between ${OFFER_FORM_LIMITS.NAME_MIN} and ${OFFER_FORM_LIMITS.NAME_MAX} characters.`,
            );
            return;
        }

        const discountNum = Number(discountPercentage);
        if (
            discountPercentage === '' ||
            Number.isNaN(discountNum) ||
            discountNum < OFFER_FORM_LIMITS.MIN_DISCOUNT ||
            discountNum > OFFER_FORM_LIMITS.MAX_DISCOUNT
        ) {
            setError(
                `Discount percentage must be between ${OFFER_FORM_LIMITS.MIN_DISCOUNT}% and ${OFFER_FORM_LIMITS.MAX_DISCOUNT}%.`,
            );
            return;
        }

        if (!validFrom || !validUntil) {
            setError('Both Start Date and End Date are required.');
            return;
        }

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const fromDateObj = new Date(`${validFrom}T00:00:00`);
        const untilDateObj = new Date(`${validUntil}T23:59:59.999`);

        if (isNaN(fromDateObj.getTime()) || isNaN(untilDateObj.getTime())) {
            setError('Invalid date values provided for Start Date or End Date.');
            return;
        }

        if (fromDateObj.getTime() > untilDateObj.getTime()) {
            setError('Valid Until date must be on or later than Valid From date.');
            return;
        }

        if (untilDateObj.getTime() < Date.now()) {
            setError('Valid Until date must be in the future.');
            return;
        }

        if (!editingOfferId && fromDateObj.getTime() < startOfToday.getTime()) {
            setError('Valid From date cannot be in the past.');
            return;
        }

        try {
            if (editingOfferId) {
                // Update existing offer in-place, preserving its id and isActive status
                const updated: PlanOfferInputPayload[] = currentOffers.map((o) => {
                    if (o.id === editingOfferId) {
                        return {
                            id: o.id,
                            name: trimmedName,
                            code: o.code || trimmedName.toUpperCase().replace(/\s+/g, '_').substring(0, 30),
                            discountPercentage: discountNum,
                            validFrom: fromDateObj.toISOString(),
                            validUntil: untilDateObj.toISOString(),
                            isActive: o.isActive,
                        };
                    }
                    return {
                        id: o.id,
                        name: o.name || o.code || 'Promotional Offer',
                        code: o.code,
                        discountPercentage: o.discountPercentage,
                        validFrom: typeof o.validFrom === 'string' ? o.validFrom : new Date(o.validFrom).toISOString(),
                        validUntil: typeof o.validUntil === 'string' ? o.validUntil : new Date(o.validUntil).toISOString(),
                        isActive: o.isActive,
                    };
                });

                await onUpdateOffers(item.id, updated);
                handleCancelEdit();
            } else {
                // Attach new offer
                const existingMapped: PlanOfferInputPayload[] = currentOffers.map((o) => ({
                    id: o.id,
                    name: o.name || o.code || 'Promotional Offer',
                    code: o.code,
                    discountPercentage: o.discountPercentage,
                    validFrom: typeof o.validFrom === 'string' ? o.validFrom : new Date(o.validFrom).toISOString(),
                    validUntil: typeof o.validUntil === 'string' ? o.validUntil : new Date(o.validUntil).toISOString(),
                    isActive: o.isActive,
                }));

                const newOffer: PlanOfferInputPayload = {
                    name: trimmedName,
                    code: trimmedName.toUpperCase().replace(/\s+/g, '_').substring(0, 30),
                    discountPercentage: discountNum,
                    validFrom: fromDateObj.toISOString(),
                    validUntil: untilDateObj.toISOString(),
                    isActive: true,
                };

                await onUpdateOffers(item.id, [...existingMapped, newOffer]);

                setCampaignName('');
                setDiscountPercentage('');
                setValidFrom('');
                setValidUntil('');
            }
        } catch (err: unknown) {
            setError(getErrorMessage(err));
        }
    };

    return (
        <AdminModal
            isOpen={isOpen}
            onClose={onClose}
            title={`OFFERS: ${item.name}`}
            subtitle={`Manage promotional discounts attached to ${item.code}`}
            size="lg"
        >
            <div className={styles.container}>
                {error && (
                    <div className={styles.errorBanner} role="alert">
                        <span className={styles.errorBannerContent}>{error}</span>
                        <button
                            type="button"
                            className={styles.errorDismissBtn}
                            onClick={() => setError(null)}
                            aria-label="Dismiss error message"
                            title="Dismiss"
                        >
                            &times;
                        </button>
                    </div>
                )}

                <div className={styles.sectionTitle}>
                    Configured Promotional Offers ({currentOffers.length})
                </div>

                <div className={styles.offersList}>
                    {currentOffers.length === 0 ? (
                        <div className={styles.emptyOffers}>
                            No promotional offers attached to this {itemTypeLabel.toLowerCase()}.
                        </div>
                    ) : (
                        currentOffers.map((offer, idx) => {
                            const status = getOfferStatus(offer);
                            const statusBadgeClass =
                                status === 'ACTIVE'
                                    ? styles.statusActive
                                    : status === 'SCHEDULED'
                                    ? styles.statusScheduled
                                    : status === 'EXPIRED'
                                    ? styles.statusExpired
                                    : styles.statusDisabled;

                            return (
                                <div key={offer.id || `${offer.name}_${idx}`} className={styles.offerCard}>
                                    <div className={styles.offerInfo}>
                                        <div className={styles.offerHeader}>
                                            <span className={styles.offerName}>
                                                {offer.name || offer.code || 'Promotional Offer'}
                                            </span>
                                            <span className={`${styles.statusBadge} ${statusBadgeClass}`}>
                                                {status}
                                            </span>
                                            <span className={styles.offerDiscount}>
                                                {offer.discountPercentage}% OFF
                                            </span>
                                        </div>
                                        <span className={styles.offerDates}>
                                            {new Date(offer.validFrom).toLocaleDateString()} &rarr;{' '}
                                            {new Date(offer.validUntil).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <div className={styles.offerControls}>
                                        {confirmDeleteIndex === idx ? (
                                            <div className={styles.confirmDeleteGroup}>
                                                <span className={styles.confirmDeletePrompt}>Remove?</span>
                                                <button
                                                    type="button"
                                                    className={styles.confirmDeleteBtn}
                                                    onClick={() => {
                                                        setConfirmDeleteIndex(null);
                                                        handleDeleteOffer(idx);
                                                    }}
                                                    disabled={isUpdating}
                                                    title="Confirm deletion"
                                                >
                                                    Delete
                                                </button>
                                                <button
                                                    type="button"
                                                    className={styles.cancelDeleteBtn}
                                                    onClick={() => setConfirmDeleteIndex(null)}
                                                    disabled={isUpdating}
                                                    title="Cancel deletion"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <button
                                                    type="button"
                                                    className={`${styles.toggleBtn} ${
                                                        offer.isActive ? styles.toggleBtnActive : styles.toggleBtnInactive
                                                    }`}
                                                    onClick={() => {
                                                        setConfirmDeleteIndex(null);
                                                        handleToggleOffer(idx);
                                                    }}
                                                    disabled={isUpdating}
                                                    title={offer.isActive ? 'Disable offer' : 'Enable offer'}
                                                >
                                                    {offer.isActive ? 'ACTIVE' : 'DISABLED'}
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`${styles.editBtn} ${
                                                        editingOfferId === offer.id ? styles.editBtnActive : ''
                                                    }`}
                                                    onClick={() => handleStartEdit(offer)}
                                                    disabled={isUpdating}
                                                    title="Edit offer"
                                                    aria-label={`Edit offer ${offer.name || offer.code}`}
                                                >
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                    </svg>
                                                </button>
                                                <button
                                                    type="button"
                                                    className={styles.deleteBtn}
                                                    onClick={() => setConfirmDeleteIndex(idx)}
                                                    disabled={isUpdating}
                                                    title="Remove offer"
                                                    aria-label={`Remove offer ${offer.name || offer.code}`}
                                                >
                                                    &times;
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <form onSubmit={handleSubmitOffer} className={styles.addForm}>
                    <div className={styles.sectionHeaderRow}>
                        <div className={styles.sectionTitle}>
                            {editingOfferId ? 'Edit Promotional Offer' : 'Attach New Promotional Offer'}
                        </div>
                        {editingOfferId && (
                            <span className={styles.editingBadge}>Editing Mode</span>
                        )}
                    </div>

                    <div className={styles.addFormRow}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Campaign / Offer Name</label>
                            <input
                                type="text"
                                className={styles.input}
                                value={campaignName}
                                onChange={(e) => {
                                    clearError();
                                    setCampaignName(e.target.value);
                                }}
                                placeholder="e.g. Diwali Flash Sale"
                                disabled={isUpdating}
                                maxLength={OFFER_FORM_LIMITS.NAME_MAX}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Discount (%)</label>
                            <input
                                type="number"
                                min={OFFER_FORM_LIMITS.MIN_DISCOUNT}
                                max={OFFER_FORM_LIMITS.MAX_DISCOUNT}
                                className={styles.input}
                                value={discountPercentage}
                                onChange={(e) => {
                                    clearError();
                                    setDiscountPercentage(
                                        e.target.value === '' ? '' : Number(e.target.value),
                                    );
                                }}
                                placeholder="20"
                                disabled={isUpdating}
                            />
                        </div>
                    </div>

                    <div className={styles.addFormRow}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Valid From</label>
                            <div className={styles.dateInputWrapper}>
                                <input
                                    ref={validFromInputRef}
                                    type="date"
                                    min={todayStr}
                                    className={styles.dateInput}
                                    value={validFrom}
                                    onChange={(e) => {
                                        clearError();
                                        setValidFrom(e.target.value);
                                    }}
                                    onClick={(e) => e.currentTarget.showPicker?.()}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') e.currentTarget.showPicker?.();
                                    }}
                                    disabled={isUpdating}
                                    aria-label="Valid From Date"
                                />
                                <span
                                    className={styles.calendarIcon}
                                    aria-hidden="true"
                                    onClick={() => validFromInputRef.current?.showPicker?.()}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                        <line x1="16" y1="2" x2="16" y2="6"></line>
                                        <line x1="8" y1="2" x2="8" y2="6"></line>
                                        <line x1="3" y1="10" x2="21" y2="10"></line>
                                    </svg>
                                </span>
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Valid Until</label>
                            <div className={styles.dateInputWrapper}>
                                <input
                                    ref={validUntilInputRef}
                                    type="date"
                                    min={validFrom || todayStr}
                                    className={styles.dateInput}
                                    value={validUntil}
                                    onChange={(e) => {
                                        clearError();
                                        setValidUntil(e.target.value);
                                    }}
                                    onClick={(e) => e.currentTarget.showPicker?.()}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') e.currentTarget.showPicker?.();
                                    }}
                                    disabled={isUpdating}
                                    aria-label="Valid Until Date"
                                />
                                <span
                                    className={styles.calendarIcon}
                                    aria-hidden="true"
                                    onClick={() => validUntilInputRef.current?.showPicker?.()}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                        <line x1="16" y1="2" x2="16" y2="6"></line>
                                        <line x1="8" y1="2" x2="8" y2="6"></line>
                                        <line x1="3" y1="10" x2="21" y2="10"></line>
                                    </svg>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.formBtnRow}>
                        {editingOfferId && (
                            <button
                                type="button"
                                className={styles.cancelEditBtn}
                                onClick={handleCancelEdit}
                                disabled={isUpdating}
                            >
                                Cancel Edit
                            </button>
                        )}
                        <button
                            type="submit"
                            className={styles.addBtn}
                            disabled={isUpdating}
                        >
                            {isUpdating
                                ? 'Saving...'
                                : editingOfferId
                                ? 'Save Changes'
                                : `Add Offer to ${itemTypeLabel}`}
                        </button>
                    </div>
                </form>

                <div className={styles.footer}>
                    <button
                        type="button"
                        className={styles.closeBtn}
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </div>
        </AdminModal>
    );
};
