import React, { useState, useEffect } from 'react';
import styles from './cancel-subscription-modal.module.css';

export interface CancelSubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason?: string) => Promise<void> | void;
    isSubmitting?: boolean;
    currentPeriodEnd?: string | null;
}

const CANCELLATION_REASONS = [
    'Found a meaningful connection on MERGE',
    'Taking a temporary break from dating',
    'Too expensive / looking for promotions',
    'Not receiving enough compatible matches',
    'Technical issues or prefer basic features',
    'Other reason',
];

export const CancelSubscriptionModal: React.FC<CancelSubscriptionModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    isSubmitting = false,
    currentPeriodEnd,
}) => {
    const [selectedReason, setSelectedReason] = useState(CANCELLATION_REASONS[0]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen && !isSubmitting) {
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isSubmitting, onClose]);

    if (!isOpen) return null;

    const formattedDate = currentPeriodEnd
        ? new Date(currentPeriodEnd).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
          })
        : 'the end of your current cycle';

    const handleConfirm = () => {
        onConfirm(selectedReason);
    };

    return (
        <div className={styles.overlay} onClick={isSubmitting ? undefined : onClose} role="dialog" aria-modal="true">
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button
                    className={styles.closeButton}
                    onClick={onClose}
                    disabled={isSubmitting}
                    aria-label="Close modal"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                <div className={styles.iconWrapper}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                </div>

                <h2 className={styles.title}>Cancel Subscription</h2>
                <p className={styles.subtitle}>
                    Auto-renewal will be turned off. You will not be charged again, and your Premium benefits will remain active until{' '}
                    <span className={styles.highlightDate}>{formattedDate}</span>.
                </p>

                <div className={styles.benefitsCard}>
                    <span className={styles.benefitsTitle}>You will retain access to:</span>
                    <ul className={styles.benefitsList}>
                        <li>Unlimited Scene Partner AI rehearsal sessions</li>
                        <li>5 high-quota daily match recommendations</li>
                        <li>Deep compatibility lifestyle and habits filters</li>
                    </ul>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="cancel-reason" className={styles.label}>
                        Help us improve. Why are you cancelling?
                    </label>
                    <select
                        id="cancel-reason"
                        className={styles.select}
                        value={selectedReason}
                        onChange={(e) => setSelectedReason(e.target.value)}
                        disabled={isSubmitting}
                    >
                        {CANCELLATION_REASONS.map((reason) => (
                            <option key={reason} value={reason}>
                                {reason}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.actionsRow}>
                    <button
                        type="button"
                        className={styles.keepButton}
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Keep Subscription
                    </button>

                    <button
                        type="button"
                        className={styles.confirmButton}
                        onClick={handleConfirm}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Cancelling...' : 'Confirm Cancellation'}
                    </button>
                </div>
            </div>
        </div>
    );
};
