import React, { useState } from 'react';
import type { BillingTransactionDto } from '../../types/billing.types';
import { TRANSACTION_STATUS_CONFIG } from '../../constants/billing.constants';
import { formatCurrencyDisplay } from '../../utils/currency.util';
import { DataTable, type DataTableColumn } from '../../../../shared/components/tables';
import styles from './billing-history-table.module.css';

export interface BillingHistoryTableProps {
    transactions?: BillingTransactionDto[];
    total?: number;
    page: number;
    limit: number;
    isLoading?: boolean;
    onPageChange: (newPage: number) => void;
}

export const BillingHistoryTable: React.FC<BillingHistoryTableProps> = ({
    transactions = [],
    total = 0,
    page,
    limit,
    isLoading = false,
    onPageChange,
}) => {
    const [copiedId, setCopiedId] = useState<string | null>(null);

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

    const handleCopy = (id: string, text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const getStatusClass = (status: string) => {
        const config = TRANSACTION_STATUS_CONFIG[status];
        if (!config) return styles.badgeSuccess;
        switch (config.variant) {
            case 'success':
                return styles.badgeSuccess;
            case 'warning':
                return styles.badgeWarning;
            case 'danger':
                return styles.badgeDanger;
            default:
                return styles.badgeSuccess;
        }
    };

    const columns: DataTableColumn<BillingTransactionDto>[] = [
        {
            id: 'date',
            header: 'Date',
            render: (tx) => <span className={styles.dateText}>{formatDate(tx.createdAt)}</span>,
        },
        {
            id: 'description',
            header: 'Description',
            render: (tx) => <span className={styles.descriptionText}>{tx.description}</span>,
        },
        {
            id: 'amount',
            header: 'Amount',
            render: (tx) => (
                <span className={styles.amountText}>
                    {formatCurrencyDisplay(tx.amount?.formatted) || 'Free'}
                </span>
            ),
        },
        {
            id: 'status',
            header: 'Status',
            render: (tx) => {
                const statusMeta = TRANSACTION_STATUS_CONFIG[tx.status] || { label: tx.status };
                return (
                    <span className={`${styles.badge} ${getStatusClass(tx.status)}`}>
                        {statusMeta.label}
                    </span>
                );
            },
        },
        {
            id: 'receipt',
            header: 'Receipt / Reference',
            render: (tx) => {
                const referenceText = tx.receiptNumber || tx.gatewayPaymentId || tx.referenceId || tx.id;
                const isCopied = copiedId === tx.id;
                return (
                    <div className={styles.receiptWrapper}>
                        <span className={styles.receiptCode}>
                            {referenceText ? `${referenceText.slice(0, 14)}...` : '—'}
                        </span>
                        {referenceText && (
                            <button
                                type="button"
                                className={styles.copyButton}
                                onClick={() => handleCopy(tx.id, referenceText)}
                                title="Copy full reference code"
                            >
                                {isCopied ? 'Copied' : 'Copy'}
                            </button>
                        )}
                    </div>
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
            emptyTitle="No billing transactions recorded yet"
            emptyDescription="Your subscription and credit pack transactions will appear here."
            emptyIcon={(
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                </svg>
            )}
        />
    );
};
