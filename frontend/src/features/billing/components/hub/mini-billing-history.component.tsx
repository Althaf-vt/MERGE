import React from 'react';
import type { BillingTransactionDto } from '../../types/billing.types';
import { TRANSACTION_STATUS_CONFIG } from '../../constants/billing.constants';
import styles from './mini-billing-history.module.css';

export interface MiniBillingHistoryProps {
    transactions?: BillingTransactionDto[];
    isLoading?: boolean;
    onViewAll?: () => void;
}

export const MiniBillingHistory: React.FC<MiniBillingHistoryProps> = ({
    transactions = [],
    isLoading = false,
    onViewAll,
}) => {
    if (isLoading) {
        return (
            <div className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.skeleton} style={{ width: '120px', height: '1.25rem' }} />
                    <div className={styles.skeleton} style={{ width: '60px', height: '1rem' }} />
                </div>
                <div className={styles.list}>
                    <div className={styles.item}>
                        <div className={styles.skeleton} style={{ width: '140px', height: '1rem' }} />
                        <div className={styles.skeleton} style={{ width: '60px', height: '1rem' }} />
                    </div>
                    <div className={styles.item}>
                        <div className={styles.skeleton} style={{ width: '120px', height: '1rem' }} />
                        <div className={styles.skeleton} style={{ width: '60px', height: '1rem' }} />
                    </div>
                </div>
            </div>
        );
    }

    const recentRecords = transactions.slice(0, 3);

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

    const getStatusClass = (status: string) => {
        const config = TRANSACTION_STATUS_CONFIG[status];
        if (!config) return styles.statusSuccess;
        switch (config.variant) {
            case 'success':
                return styles.statusSuccess;
            case 'warning':
                return styles.statusWarning;
            case 'danger':
                return styles.statusDanger;
            default:
                return styles.statusSuccess;
        }
    };

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <h3 className={styles.title}>Billing History</h3>
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

            {recentRecords.length === 0 ? (
                <div className={styles.emptyState}>No billing records found.</div>
            ) : (
                <div className={styles.list}>
                    {recentRecords.map((item) => {
                        const statusMeta = TRANSACTION_STATUS_CONFIG[item.status] || { label: item.status };
                        return (
                            <div key={item.id} className={styles.item}>
                                <div className={styles.itemLeft}>
                                    <span className={styles.itemDescription}>{item.description}</span>
                                    <span className={styles.itemDate}>{formatDate(item.createdAt)}</span>
                                </div>
                                <div className={styles.itemRight}>
                                    <span className={styles.itemAmount}>
                                        {item.amount?.formatted || 'Free'}
                                    </span>
                                    <span className={`${styles.statusBadge} ${getStatusClass(item.status)}`}>
                                        {statusMeta.label}
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
