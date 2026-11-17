import React, { useState } from 'react';
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

    const handleAddOffer = async (e: React.FormEvent) => {
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

        if (new Date(validFrom) >= new Date(validUntil)) {
            setError('Valid Until date must be later than Valid From date.');
            return;
        }

        try {
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
                validFrom: new Date(validFrom).toISOString(),
                validUntil: new Date(validUntil).toISOString(),
                isActive: true,
            };

            await onUpdateOffers(item.id, [...existingMapped, newOffer]);

            setCampaignName('');
            setDiscountPercentage('');
            setValidFrom('');
            setValidUntil('');
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
                {error && <div className={styles.errorBanner}>{error}</div>}

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
                                        <button
                                            type="button"
                                            className={`${styles.toggleBtn} ${
                                                offer.isActive ? styles.toggleBtnActive : styles.toggleBtnInactive
                                            }`}
                                            onClick={() => handleToggleOffer(idx)}
                                            disabled={isUpdating}
                                            title={offer.isActive ? 'Disable offer' : 'Enable offer'}
                                        >
                                            {offer.isActive ? 'ACTIVE' : 'DISABLED'}
                                        </button>
                                        <button
                                            type="button"
                                            className={styles.deleteBtn}
                                            onClick={() => handleDeleteOffer(idx)}
                                            disabled={isUpdating}
                                            title="Delete offer"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <form onSubmit={handleAddOffer} className={styles.addForm}>
                    <div className={styles.sectionTitle}>Attach New Promotional Offer</div>

                    <div className={styles.addFormRow}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Campaign / Offer Name</label>
                            <input
                                type="text"
                                className={styles.input}
                                value={campaignName}
                                onChange={(e) => setCampaignName(e.target.value)}
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
                                onChange={(e) =>
                                    setDiscountPercentage(
                                        e.target.value === '' ? '' : Number(e.target.value),
                                    )
                                }
                                placeholder="20"
                                disabled={isUpdating}
                            />
                        </div>
                    </div>

                    <div className={styles.addFormRow}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Valid From</label>
                            <input
                                type="date"
                                className={styles.input}
                                value={validFrom}
                                onChange={(e) => setValidFrom(e.target.value)}
                                disabled={isUpdating}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Valid Until</label>
                            <input
                                type="date"
                                className={styles.input}
                                value={validUntil}
                                onChange={(e) => setValidUntil(e.target.value)}
                                disabled={isUpdating}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={styles.addBtn}
                        disabled={isUpdating}
                    >
                        {isUpdating ? 'Saving...' : `Add Offer to ${itemTypeLabel}`}
                    </button>
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
