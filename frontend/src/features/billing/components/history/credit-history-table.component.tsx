import React from 'react';
import type { BillingTransactionDto } from '../../types/billing.types';
import { TRANSACTION_STATUS_CONFIG } from '../../constants/billing.constants';
import { DataTable, type DataTableColumn } from '../../../../shared/components/tables';
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

    const columns: DataTableColumn<BillingTransactionDto>[] = [
        {
            id: 'date',
            header: 'Date',
            render: (tx) => <span className={styles.dateText}>{formatDate(tx.createdAt)}</span>,
        },
        {
            id: 'activity',
            header: 'Activity',
            render: (tx) => {
                const activity = getActivityDetails(tx);
                return (
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
                                    <line x1="12" y1="5" x2="12" y2="19" />
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                            ) : (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                            )}
                        </div>
                        <span className={styles.activityLabel}>{activity.label}</span>
                    </div>
                );
            },
        },
        {
            id: 'description',
            header: 'Description',
            render: (tx) => (
                <span className={styles.descriptionText} title={tx.description}>
                    {tx.description}
                </span>
            ),
        },
        {
            id: 'creditsDelta',
            header: 'Credits Delta',
            render: (tx) => renderDelta(tx.creditsDelta),
        },
        {
            id: 'status',
            header: 'Status',
            render: (tx) => {
                const statusLabel = TRANSACTION_STATUS_CONFIG[tx.status]?.label || tx.status;
                return (
                    <span className={`${styles.statusBadge} ${getStatusClass(tx.status)}`}>
                        {statusLabel}
                    </span>
                );
            },
        },
    ];

    return (
        <DataTable<BillingTransactionDto>
            columns={columns}
            data={transactions}
            keyExtractor={(tx) => tx.id}
            isLoading={isLoading}
            page={page}
            limit={limit}
            total={total}
            onPageChange={onPageChange}
            emptyTitle="No credit activity yet"
            emptyDescription="Your credit pack purchases and priority introduction usages will appear here."
            emptyIcon={(
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                    <path d="M12 18V6" />
                </svg>
            )}
        />
    );
};
