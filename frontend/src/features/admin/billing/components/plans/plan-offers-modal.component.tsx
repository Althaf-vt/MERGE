import React, { useState } from 'react';
import type {
    AdminPlanOfferDto,
    AdminSubscriptionPlanDto,
    PlanOfferInputPayload,
} from '../../types/admin-billing.types';
import { OFFER_FORM_LIMITS } from '../../constants/admin-billing.constants';
import { useUpdateAdminPlanMutation } from '../../api/admin-billing.api';
import { AdminModal } from '../../../../../shared/admin/components/admin-modal.component';
import { getErrorMessage } from '../../../../../shared/utils/error.util';
import styles from './plan-offers-modal.module.css';

export interface PlanOffersModalProps {
    isOpen: boolean;
    plan: AdminSubscriptionPlanDto | null;
    onClose: () => void;
}

export const PlanOffersModal: React.FC<PlanOffersModalProps> = ({
    isOpen,
    plan,
    onClose,
}) => {
    const [updatePlan, { isLoading: isUpdating }] = useUpdateAdminPlanMutation();

    const [offerCode, setOfferCode] = useState('');
    const [discountPercentage, setDiscountPercentage] = useState<number | ''>('');
    const [validFrom, setValidFrom] = useState('');
    const [validUntil, setValidUntil] = useState('');
    const [isOfferActive, setIsOfferActive] = useState(true);

    const [error, setError] = useState<string | null>(null);

    if (!isOpen || !plan) return null;

    const currentOffers: AdminPlanOfferDto[] = plan.offers || [];

    const handleToggleOffer = async (index: number) => {
        try {
            setError(null);
            const updated: PlanOfferInputPayload[] = currentOffers.map((offer, idx) => ({
                code: offer.code,
                discountPercentage: offer.discountPercentage,
                validFrom: typeof offer.validFrom === 'string' ? offer.validFrom : new Date(offer.validFrom).toISOString(),
                validUntil: typeof offer.validUntil === 'string' ? offer.validUntil : new Date(offer.validUntil).toISOString(),
                isActive: idx === index ? !offer.isActive : offer.isActive,
            }));

            await updatePlan({
                id: plan.id,
                payload: { offers: updated },
            }).unwrap();
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
                    code: offer.code,
                    discountPercentage: offer.discountPercentage,
                    validFrom: typeof offer.validFrom === 'string' ? offer.validFrom : new Date(offer.validFrom).toISOString(),
                    validUntil: typeof offer.validUntil === 'string' ? offer.validUntil : new Date(offer.validUntil).toISOString(),
                    isActive: offer.isActive,
                }));

            await updatePlan({
                id: plan.id,
                payload: { offers: updated },
            }).unwrap();
        } catch (err: unknown) {
            setError(getErrorMessage(err));
        }
    };

    const handleAddOffer = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const trimmedCode = offerCode.trim().toUpperCase();
        if (!trimmedCode) {
            setError('Offer code is required.');
            return;
        }
        if (
            trimmedCode.length < OFFER_FORM_LIMITS.CODE_MIN ||
            trimmedCode.length > OFFER_FORM_LIMITS.CODE_MAX
        ) {
            setError(`Code must be ${OFFER_FORM_LIMITS.CODE_MIN}-${OFFER_FORM_LIMITS.CODE_MAX} chars.`);
            return;
        }

        const discountNum = Number(discountPercentage);
        if (
            discountPercentage === '' ||
            Number.isNaN(discountNum) ||
            discountNum < OFFER_FORM_LIMITS.MIN_DISCOUNT ||
            discountNum > OFFER_FORM_LIMITS.MAX_DISCOUNT
        ) {
            setError(`Discount percentage must be between ${OFFER_FORM_LIMITS.MIN_DISCOUNT}% and ${OFFER_FORM_LIMITS.MAX_DISCOUNT}%.`);
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
                code: o.code,
                discountPercentage: o.discountPercentage,
                validFrom: typeof o.validFrom === 'string' ? o.validFrom : new Date(o.validFrom).toISOString(),
                validUntil: typeof o.validUntil === 'string' ? o.validUntil : new Date(o.validUntil).toISOString(),
                isActive: o.isActive,
            }));

            const newOffer: PlanOfferInputPayload = {
                code: trimmedCode,
                discountPercentage: discountNum,
                validFrom: new Date(validFrom).toISOString(),
                validUntil: new Date(validUntil).toISOString(),
                isActive: isOfferActive,
            };

            await updatePlan({
                id: plan.id,
                payload: { offers: [...existingMapped, newOffer] },
            }).unwrap();

            setOfferCode('');
            setDiscountPercentage('');
            setValidFrom('');
            setValidUntil('');
            setIsOfferActive(true);
        } catch (err: unknown) {
            setError(getErrorMessage(err));
        }
    };

    return (
        <AdminModal
            isOpen={isOpen}
            onClose={onClose}
            title={`OFFERS: ${plan.name}`}
            subtitle={`Manage promotional discounts embedded in ${plan.code}`}
            size="lg"
        >
            <div className={styles.container}>
                {error && <div className={styles.errorBanner}>{error}</div>}

                <div className={styles.sectionTitle}>Active & Configured Offers ({currentOffers.length})</div>

                <div className={styles.offersList}>
                    {currentOffers.length === 0 ? (
                        <div className={styles.emptyOffers}>
                            No promotional offers attached to this plan.
                        </div>
                    ) : (
                        currentOffers.map((offer, idx) => (
                            <div key={`${offer.code}_${idx}`} className={styles.offerCard}>
                                <div className={styles.offerInfo}>
                                    <div className={styles.offerHeader}>
                                        <span className={styles.offerCode}>{offer.code}</span>
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
                                    >
                                        {offer.isActive ? 'ACTIVE' : 'INACTIVE'}
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
                        ))
                    )}
                </div>

                <form onSubmit={handleAddOffer} className={styles.addForm}>
                    <div className={styles.sectionTitle}>Attach New Promotional Offer</div>

                    <div className={styles.addFormRow}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Offer Code</label>
                            <input
                                type="text"
                                className={styles.input}
                                value={offerCode}
                                onChange={(e) => setOfferCode(e.target.value.toUpperCase())}
                                placeholder="e.g. FESTIVE30"
                                disabled={isUpdating}
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
                                        e.target.value === '' ? '' : Number(e.target.value)
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
                        {isUpdating ? 'Saving...' : 'Add Offer to Plan'}
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
