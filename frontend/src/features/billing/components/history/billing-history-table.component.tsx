import React, { useState } from 'react';
import type { BillingTransactionDto } from '../../types/billing.types';
import { TRANSACTION_STATUS_CONFIG } from '../../constants/billing.constants';
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

    if (isLoading) {
        return (
            <div className={styles.card}>
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.th}>Date</th>
                                <th className={styles.th}>Description</th>
                                <th className={styles.th}>Amount</th>
                                <th className={styles.th}>Status</th>
                                <th className={styles.th}>Receipt / Reference</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4, 5].map((idx) => (
                                <tr key={idx}>
                                    <td colSpan={5} className={styles.td}>
                                        <div className={styles.skeletonRow} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    if (transactions.length === 0) {
        return (
            <div className={styles.card}>
                <div className={styles.emptyState}>
                    No billing transactions recorded yet.
                </div>
            </div>
        );
    }

    return (
        <div className={styles.card}>
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.th}>Date</th>
                            <th className={styles.th}>Description</th>
                            <th className={styles.th}>Amount</th>
                            <th className={styles.th}>Status</th>
                            <th className={styles.th}>Receipt / Reference</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((tx) => {
                            const statusMeta = TRANSACTION_STATUS_CONFIG[tx.status] || { label: tx.status };
                            const referenceText = tx.receiptNumber || tx.gatewayPaymentId || tx.referenceId || tx.id;
                            const isCopied = copiedId === tx.id;

                            return (
                                <tr key={tx.id} className={styles.tr}>
                                    <td className={styles.td}>
                                        <span className={styles.dateText}>{formatDate(tx.createdAt)}</span>
                                    </td>
                                    <td className={styles.td}>
                                        <span className={styles.descriptionText}>{tx.description}</span>
                                    </td>
                                    <td className={styles.td}>
                                        <span className={styles.amountText}>
                                            {tx.amount?.formatted || 'Free'}
                                        </span>
                                    </td>
                                    <td className={styles.td}>
                                        <span className={`${styles.badge} ${getStatusClass(tx.status)}`}>
                                            {statusMeta.label}
                                        </span>
                                    </td>
                                    <td className={styles.td}>
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
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className={styles.paginationBar}>
                <span>
                    Showing {startIndex}–{endIndex} of {total} transactions
                </span>

                <div className={styles.paginationControls}>
                    <button
                        type="button"
                        className={styles.pageButton}
                        disabled={page <= 1}
                        onClick={() => onPageChange(page - 1)}
                    >
                        Previous
                    </button>
                    <span>
                        Page {page} of {totalPages}
                    </span>
                    <button
                        type="button"
                        className={styles.pageButton}
                        disabled={page >= totalPages}
                        onClick={() => onPageChange(page + 1)}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};
