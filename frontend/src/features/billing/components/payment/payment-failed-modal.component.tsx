import React, { useEffect } from 'react';
import styles from './payment-failed-modal.module.css';

export interface PaymentFailedModalProps {
    isOpen: boolean;
    onClose: () => void;
    errorMessage?: string;
    onRetry?: () => void;
}

export const PaymentFailedModal: React.FC<PaymentFailedModalProps> = ({
    isOpen,
    onClose,
    errorMessage,
    onRetry,
}) => {
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

    return (
        <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button
                    className={styles.closeButton}
                    onClick={onClose}
                    aria-label="Close declined modal"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                <div className={styles.iconWrapper}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                        <line x1="2" y1="10" x2="22" y2="10"></line>
                        <line x1="2" y1="2" x2="22" y2="22"></line>
                    </svg>
                </div>

                <h2 className={styles.title}>Payment Declined</h2>
                <p className={styles.subtitle}>
                    {errorMessage || 'Your bank or card issuer declined the transaction. No charges were made.'}
                </p>

                <div className={styles.actionsContainer}>
                    {onRetry && (
                        <button
                            type="button"
                            className={styles.primaryButton}
                            onClick={onRetry}
                        >
                            Try a Different Payment Method
                        </button>
                    )}
                    <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={onClose}
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};
