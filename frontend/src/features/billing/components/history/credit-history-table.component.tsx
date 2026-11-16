import React from 'react';
import type { BillingTransactionDto } from '../../types/billing.types';
import { TRANSACTION_STATUS_CONFIG } from '../../constants/billing.constants';
import styles from './credit-history-table.module.css';

export interface CreditHistoryTableProps {
    transactions?: BillingTransactionDto[];
    total?: number;
    page: number;
    limit: number;
    isLoading?: boolean;
    onPageChange: (newPage: number) => void;
}

export const CreditHistoryTable: React.FC<CreditHistoryTableProps> = ({
    transactions = [],
    total = 0,
    page,
    limit,
    isLoading = false,
    onPageChange,
}) => {
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = total === 0 ? 0 : (page - 1) * limit + 1;
    const endIndex = Math.min(page * limit, total);

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

    const getActivityDetails = (tx: BillingTransactionDto) => {
        if (tx.type === 'CREDIT_PURCHASE') {
            return {
                label: 'Pack Purchase',
                iconType: 'PURCHASE',
            };
        }
        if (tx.type === 'CREDIT_SPENT') {
            return {
                label: 'Priority Intro',
                iconType: 'USAGE',
            };
        }
        if (tx.type === 'REFUND') {
            return {
                label: 'Refund / Adjustment',
                iconType: 'OTHER',
            };
        }
        return {
            label: 'Subscription',
            iconType: 'OTHER',
        };
    };

    const getStatusClass = (status: string) => {
        const config = TRANSACTION_STATUS_CONFIG[status];
        if (!config) return styles.badgeSuccess;
        switch (config.variant) {
            case 'success':
                return styles.badgeSuccess;
            case 'warning':
                return styles.badgePending;
            case 'danger':
                return styles.badgeFailed;
            default:
                return styles.badgeRefunded;
        }
    };

    const renderDelta = (delta?: number | null) => {
        if (delta === undefined || delta === null || delta === 0) {
            return <span className={`${styles.deltaBadge} ${styles.deltaNeutral}`}>—</span>;
        }
        if (delta > 0) {
            return (
                <span className={`${styles.deltaBadge} ${styles.deltaPositive}`}>
                    +{delta} Credits
                </span>
            );
        }
        return (
            <span className={`${styles.deltaBadge} ${styles.deltaNegative}`}>
                {delta} Credits
            </span>
        );
    };

    return (
        <div className={styles.card}>
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.th}>Date</th>
                            <th className={styles.th}>Activity</th>
                            <th className={styles.th}>Description</th>
                            <th className={styles.th}>Credits Delta</th>
                            <th className={styles.th}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, idx) => (
                                <tr key={`skeleton-${idx}`} className={styles.tr}>
                                    <td colSpan={5} className={styles.td}>
                                        <div className={styles.skeletonRow}></div>
                                    </td>
                                </tr>
                            ))
                        ) : transactions.length === 0 ? (
                            <tr>
                                <td colSpan={5}>
                                    <div className={styles.emptyState}>
                                        <div className={styles.emptyIcon}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="10"></circle>
                                                <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path>
                                                <path d="M12 18V6"></path>
                                            </svg>
                                        </div>
                                        <h4 className={styles.emptyTitle}>No credit activity yet</h4>
                                        <p className={styles.emptyText}>
                                            Your credit pack purchases and priority introduction usages will appear here.
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            transactions.map((tx) => {
                                const activity = getActivityDetails(tx);
                                const statusLabel = TRANSACTION_STATUS_CONFIG[tx.status]?.label || tx.status;
                                return (
                                    <tr key={tx.id} className={styles.tr}>
                                        <td className={styles.td}>
                                            <span className={styles.dateText}>{formatDate(tx.createdAt)}</span>
                                        </td>
                                        <td className={styles.td}>
                                            <div className={styles.activityWrapper}>
                                                <div
                                                    className={`${styles.activityIcon} ${
                                                        activity.iconType === 'PURCHASE'
                                                            ? styles.activityIconPurchase
                                                            : activity.iconType === 'USAGE'
                                                              ? styles.activityIconUsage
                                                              : styles.activityIconOther
                                                    }`}
                                                >
                                                    {activity.iconType === 'PURCHASE' ? (
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                            <line x1="12" y1="5" x2="12" y2="19"></line>
                                                            <line x1="5" y1="12" x2="19" y2="12"></line>
                                                        </svg>
                                                    ) : (
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                                        </svg>
                                                    )}
                                                </div>
                                                <span className={styles.activityLabel}>{activity.label}</span>
                                            </div>
                                        </td>
                                        <td className={styles.td}>
                                            <span className={styles.descriptionText} title={tx.description}>
                                                {tx.description}
                                            </span>
                                        </td>
                                        <td className={styles.td}>
                                            {renderDelta(tx.creditsDelta)}
                                        </td>
                                        <td className={styles.td}>
                                            <span className={`${styles.statusBadge} ${getStatusClass(tx.status)}`}>
                                                {statusLabel}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {total > 0 && (
                <div className={styles.paginationFooter}>
                    <span className={styles.paginationInfo}>
                        Showing {startIndex} to {endIndex} of {total} records
                    </span>
                    <div className={styles.paginationControls}>
                        <button
                            type="button"
                            className={styles.pageButton}
                            disabled={page <= 1 || isLoading}
                            onClick={() => onPageChange(page - 1)}
                            aria-label="Previous page"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                            <span>Previous</span>
                        </button>
                        <span className={styles.pageIndicator}>
                            Page {page} of {totalPages}
                        </span>
                        <button
                            type="button"
                            className={styles.pageButton}
                            disabled={page >= totalPages || isLoading}
                            onClick={() => onPageChange(page + 1)}
                            aria-label="Next page"
                        >
                            <span>Next</span>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
