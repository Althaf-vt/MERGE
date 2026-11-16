import React, { useState, useEffect } from 'react';
import type { SubscriptionPlanDto } from '../../types/billing.types';
import { formatCurrencyDisplay } from '../../utils/currency.util';
import styles from './upgrade-plan-modal.module.css';

export interface UpgradePlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    plans?: SubscriptionPlanDto[];
    isLoading?: boolean;
    isProcessing?: boolean;
    onUpgrade: (plan: SubscriptionPlanDto) => void;
}

export const UpgradePlanModal: React.FC<UpgradePlanModalProps> = ({
    isOpen,
    onClose,
    plans = [],
    isLoading = false,
    isProcessing = false,
    onUpgrade,
}) => {
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

    useEffect(() => {
        if (plans.length > 0 && !selectedPlanId) {
            // Default select the first active plan or Annual/Quarterly
            const preferred = plans.find((p) => p.billingPeriod === 'ANNUAL') || plans[0];
            setSelectedPlanId(preferred.id);
        }
    }, [plans, selectedPlanId]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen && !isProcessing) {
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isProcessing, onClose]);

    if (!isOpen) return null;

    const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[0];

    const handleUpgradeClick = () => {
        if (selectedPlan && !isProcessing) {
            onUpgrade(selectedPlan);
        }
    };

    return (
        <div className={styles.overlay} onClick={isProcessing ? undefined : onClose} role="dialog" aria-modal="true">
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button
                    className={styles.closeButton}
                    onClick={onClose}
                    disabled={isProcessing}
                    aria-label="Close upgrade modal"
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                <div className={styles.header}>
                    <h2 className={styles.title}>Invest In Your Eternity</h2>
                    <p className={styles.subtitle}>
                        Unlock deeper connections, smarter matchmaking, AI coaching rehearsals, and advanced relationship filters.
                    </p>
                </div>

                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '3rem 0', color: '#6b7280' }}>
                        Loading membership plans...
                    </div>
                ) : (
                    <>
                        <div className={styles.plansGrid}>
                            {plans.map((plan) => {
                                const isSelected = selectedPlanId === plan.id;
                                const isAnnual = plan.billingPeriod === 'ANNUAL';
                                const activeOffer = plan.offers?.find((o) => o.isActive);

                                const periodLabel =
                                    plan.billingPeriod === 'MONTHLY'
                                        ? '/month'
                                        : plan.billingPeriod === 'QUARTERLY'
                                          ? '/quarter'
                                          : '/year';

                                return (
                                    <div
                                        key={plan.id}
                                        className={`${styles.planCard} ${isSelected ? styles.planCardSelected : ''}`}
                                        onClick={() => setSelectedPlanId(plan.id)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                setSelectedPlanId(plan.id);
                                            }
                                        }}
                                        aria-pressed={isSelected}
                                    >
                                        {isAnnual && <span className={styles.popularBadge}>Best Value</span>}

                                        <h3 className={styles.planName}>{plan.name}</h3>

                                        <div className={styles.priceWrapper}>
                                            <span className={styles.amount}>
                                                {formatCurrencyDisplay(plan.effectivePrice?.formatted || plan.price.formatted)}
                                            </span>
                                            <span className={styles.interval}>{periodLabel}</span>

                                            {activeOffer && (
                                                <div>
                                                    <span className={styles.discountBadge}>
                                                        Save {activeOffer.discountPercentage}%
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <ul className={styles.featuresList}>
                                            <li className={styles.featureItem}>
                                                <span className={styles.featureCheck}>
                                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="20 6 9 17 4 12"></polyline>
                                                    </svg>
                                                </span>
                                                <span>Unlimited Scene Partner Sessions</span>
                                            </li>
                                            <li className={styles.featureItem}>
                                                <span className={styles.featureCheck}>
                                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="20 6 9 17 4 12"></polyline>
                                                    </svg>
                                                </span>
                                                <span>5 Daily High-Quota Matches</span>
                                            </li>
                                            <li className={styles.featureItem}>
                                                <span className={styles.featureCheck}>
                                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="20 6 9 17 4 12"></polyline>
                                                    </svg>
                                                </span>
                                                <span>Deep Compatibility Lifestyle Filters</span>
                                            </li>
                                            <li className={styles.featureItem}>
                                                <span className={styles.featureCheck}>
                                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="20 6 9 17 4 12"></polyline>
                                                    </svg>
                                                </span>
                                                <span>Priority Chat Requests & Placement</span>
                                            </li>
                                        </ul>

                                        <button
                                            type="button"
                                            className={styles.selectButton}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedPlanId(plan.id);
                                            }}
                                        >
                                            {isSelected ? 'Selected' : 'Select Plan'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        <div className={styles.footerActions}>
                            <button
                                type="button"
                                className={styles.upgradeButton}
                                onClick={handleUpgradeClick}
                                disabled={!selectedPlan || isProcessing}
                            >
                                {isProcessing ? (
                                    <>
                                        <div className={styles.spinner} />
                                        <span>Processing Checkout...</span>
                                    </>
                                ) : (
                                    <span>
                                        Upgrade to {selectedPlan?.name || 'Premium'} (
                                        {formatCurrencyDisplay(selectedPlan?.effectivePrice?.formatted || selectedPlan?.price.formatted)})
                                    </span>
                                )}
                            </button>

                            <span className={styles.guaranteeText}>
                                Encrypted 256-bit payment • Cancel anytime from your account settings
                            </span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
