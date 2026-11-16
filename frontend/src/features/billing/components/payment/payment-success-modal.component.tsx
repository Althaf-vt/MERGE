import React, { useEffect, useState } from 'react';
import { formatCurrencyDisplay } from '../../utils/currency.util';
import styles from './payment-success-modal.module.css';

export interface PaymentSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    itemName: string;
    amountFormatted?: string;
    referenceId?: string;
    isSubscription?: boolean;
    onPrimaryAction?: () => void;
    onSecondaryAction?: () => void;
}

export const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({
    isOpen,
    onClose,
    itemName,
    amountFormatted,
    referenceId,
    isSubscription = false,
    onPrimaryAction,
    onSecondaryAction,
}) => {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleCopyReference = () => {
        if (!referenceId) return;
        navigator.clipboard.writeText(referenceId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePrimaryClick = () => {
        if (onPrimaryAction) {
            onPrimaryAction();
        } else {
            onClose();
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button
                    className={styles.closeButton}
                    onClick={onClose}
                    aria-label="Close success modal"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                <div className={styles.iconWrapper}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </div>

                <h2 className={styles.title}>Payment Successful.</h2>
                <p className={styles.subtitle}>
                    {isSubscription
                        ? 'Your account has been upgraded to Premium. Your exclusive benefits are active immediately.'
                        : 'Your credits have been added to your balance and are ready for Priority Introductions.'}
                </p>

                <div className={styles.summaryCard}>
                    <div className={styles.summaryRow}>
                        <span className={styles.summaryLabel}>{itemName}</span>
                        {amountFormatted && (
                            <span className={styles.summaryPrice}>{formatCurrencyDisplay(amountFormatted)}</span>
                        )}
                    </div>
                    {referenceId && (
                        <div className={styles.referenceRow}>
                            <span>Reference: <span className={styles.referenceCode}>{referenceId}</span></span>
                            <button
                                type="button"
                                className={styles.copyButton}
                                onClick={handleCopyReference}
                            >
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                    )}
                </div>

                <div className={styles.actionsContainer}>
                    <button
                        type="button"
                        className={styles.primaryButton}
                        onClick={handlePrimaryClick}
                    >
                        Return to Dashboard
                    </button>
                    {onSecondaryAction && isSubscription && (
                        <button
                            type="button"
                            className={styles.secondaryButton}
                            onClick={onSecondaryAction}
                        >
                            Try the AI Coach
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
