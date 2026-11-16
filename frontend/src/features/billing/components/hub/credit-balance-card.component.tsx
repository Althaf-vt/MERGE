import React from 'react';
import styles from './credit-balance-card.module.css';

export interface CreditBalanceCardProps {
    balance: number;
    isLoading?: boolean;
    onBuyCredits?: () => void;
}

export const CreditBalanceCard: React.FC<CreditBalanceCardProps> = ({
    balance,
    isLoading = false,
    onBuyCredits,
}) => {
    if (isLoading) {
        return (
            <div className={styles.card}>
                <div className={styles.skeleton} style={{ width: '48px', height: '48px', borderRadius: '50%', marginBottom: '0.875rem' }} />
                <div className={styles.skeleton} style={{ width: '100px', height: '0.875rem', marginBottom: '0.5rem' }} />
                <div className={styles.skeleton} style={{ width: '80px', height: '2.5rem', marginBottom: '1.25rem' }} />
                <div className={styles.skeleton} style={{ width: '100%', height: '2.5rem', borderRadius: '10px' }} />
            </div>
        );
    }

    return (
        <div className={styles.card}>
            <div className={styles.iconWrapper}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9"></circle>
                    <path d="M14.5 9h-5v6h5"></path>
                    <path d="M9.5 12h4"></path>
                </svg>
            </div>

            <span className={styles.label}>Available Credits</span>
            <div className={styles.balanceValue}>{balance}</div>

            <button
                type="button"
                className={styles.buyButton}
                onClick={onBuyCredits}
            >
                Buy Credits
            </button>
        </div>
    );
};
