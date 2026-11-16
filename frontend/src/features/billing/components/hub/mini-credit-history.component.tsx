import React from 'react';
import type { BillingTransactionDto } from '../../types/billing.types';
import { TRANSACTION_TYPE_CONFIG } from '../../constants/billing.constants';
import styles from './mini-credit-history.module.css';

export interface MiniCreditHistoryProps {
    transactions?: BillingTransactionDto[];
    isLoading?: boolean;
    onViewAll?: () => void;
}

export const MiniCreditHistory: React.FC<MiniCreditHistoryProps> = ({
    transactions = [],
    isLoading = false,
    onViewAll,
}) => {
    if (isLoading) {
        return (
            <div className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.skeleton} style={{ width: '130px', height: '1.25rem' }} />
                    <div className={styles.skeleton} style={{ width: '60px', height: '1rem' }} />
                </div>
                <div className={styles.list}>
                    <div className={styles.item}>
                        <div className={styles.skeleton} style={{ width: '150px', height: '1rem' }} />
                        <div className={styles.skeleton} style={{ width: '70px', height: '1rem' }} />
                    </div>
                    <div className={styles.item}>
                        <div className={styles.skeleton} style={{ width: '130px', height: '1rem' }} />
                        <div className={styles.skeleton} style={{ width: '70px', height: '1rem' }} />
                    </div>
                </div>
            </div>
        );
    }

    const creditTransactions = transactions
        .filter((tx) => tx.type === 'CREDIT_PURCHASE' || tx.type === 'CREDIT_SPENT' || tx.creditsDelta !== 0)
        .slice(0, 3);

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            });
        } catch {
            return dateStr;
        }
    };

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <h3 className={styles.title}>Credit History</h3>
                {onViewAll && (
                    <button
                        type="button"
                        className={styles.viewAllLink}
                        onClick={onViewAll}
                    >
                        View All
                    </button>
                )}
            </div>

            {creditTransactions.length === 0 ? (
                <div className={styles.emptyState}>No credit activity recorded yet.</div>
            ) : (
                <div className={styles.list}>
                    {creditTransactions.map((item) => {
                        const typeConfig = TRANSACTION_TYPE_CONFIG[item.type];
                        const isPositive = item.creditsDelta > 0;
                        const deltaFormatted = isPositive
                            ? `+${item.creditsDelta} Credits`
                            : `${item.creditsDelta} Credits`;

                        const displayLabel = item.description || (typeConfig ? typeConfig.label : item.type);

                        return (
                            <div key={item.id} className={styles.item}>
                                <div className={styles.itemLeft}>
                                    <span className={styles.itemActivity}>{displayLabel}</span>
                                    <span className={styles.itemDate}>{formatDate(item.createdAt)}</span>
                                </div>
                                <div className={styles.itemDelta}>
                                    <span className={isPositive ? styles.deltaPositive : styles.deltaNegative}>
                                        {deltaFormatted}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
