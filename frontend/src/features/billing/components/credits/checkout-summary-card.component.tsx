import React from 'react';
import { formatCurrencyDisplay } from '../../utils/currency.util';
import styles from './checkout-summary-card.module.css';

export interface CheckoutSummaryCardProps {
    itemName?: string;
    itemDescription?: string;
    amountFormatted?: string;
    isProcessing?: boolean;
    onContinueToPayment: () => void;
    disabled?: boolean;
}

export const CheckoutSummaryCard: React.FC<CheckoutSummaryCardProps> = ({
    itemName,
    itemDescription,
    amountFormatted,
    isProcessing = false,
    onContinueToPayment,
    disabled = false,
}) => {
    const isReady = Boolean(itemName && amountFormatted);
    const isButtonDisabled = disabled || !isReady || isProcessing;

    return (
        <div className={styles.card}>
            <span className={styles.headerLabel}>Checkout Summary</span>

            {isReady ? (
                <div className={styles.itemRow}>
                    <div className={styles.itemInfo}>
                        <span className={styles.itemName}>{itemName}</span>
                        {itemDescription && (
                            <span className={styles.itemDescription}>{itemDescription}</span>
                        )}
                    </div>
                    <span className={styles.amount}>{formatCurrencyDisplay(amountFormatted)}</span>
                </div>
            ) : (
                <div className={styles.emptyStateText}>
                    Please select a credit pack or plan above to proceed.
                </div>
            )}

            <div className={styles.securityBadge}>
                <span className={styles.securityIcon}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                </span>
                <span>Secure 256-bit SSL Checkout • Powered by Razorpay</span>
            </div>

            <button
                type="button"
                className={styles.checkoutButton}
                onClick={onContinueToPayment}
                disabled={isButtonDisabled}
            >
                {isProcessing ? (
                    <>
                        <div className={styles.spinner} />
                        <span>Initializing Payment...</span>
                    </>
                ) : (
                    <>
                        <span>Continue to Payment</span>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                    </>
                )}
            </button>
        </div>
    );
};
