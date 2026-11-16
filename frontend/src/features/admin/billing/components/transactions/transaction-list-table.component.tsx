import React, { useState } from 'react';
import type { AdminBillingTransactionDto } from '../../types/admin-billing.types';
import {
    AdminTable,
    type AdminTableColumn,
} from '../../../../../shared/admin/components/admin-table.component';
import { AdminPagination } from '../../../../../shared/admin/components/admin-pagination.component';
import {
    PaymentEnvironmentBadge,
    TransactionStatusBadge,
    TransactionTypeBadge,
} from '../shared/billing-badge.component';
import styles from './transaction-list-table.module.css';

export interface TransactionListTableProps {
    transactions: AdminBillingTransactionDto[];
    total: number;
    page: number;
    limit: number;
    isLoading?: boolean;
    isFetching?: boolean;
    onPageChange: (newPage: number) => void;
    onSelectTransaction: (transaction: AdminBillingTransactionDto) => void;
}

export const TransactionListTable: React.FC<TransactionListTableProps> = ({
    transactions,
    total,
    page,
    limit,
    isLoading = false,
    isFetching = false,
    onPageChange,
    onSelectTransaction,
}) => {
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleCopy = (e: React.MouseEvent, text: string) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        setCopiedId(text);
        setTimeout(() => setCopiedId(null), 1500);
    };

    const columns: AdminTableColumn<AdminBillingTransactionDto>[] = [
        {
            header: 'TRANSACTION ID',
            render: (txn) => (
                <div
                    className={styles.txnIdCell}
                    onClick={() => onSelectTransaction(txn)}
                    title="Inspect transaction details"
                >
                    <span>{txn.id.slice(0, 10)}...</span>
                    <button
                        type="button"
                        className={styles.copyBtn}
                        onClick={(e) => handleCopy(e, txn.id)}
                        title="Copy full transaction ID"
                    >
                        {copiedId === txn.id ? (
                            '✓'
                        ) : (
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                        )}
                    </button>
                </div>
            ),
        },
        {
            header: 'USER ID',
            render: (txn) => (
                <div className={styles.userCell}>
                    <span className={styles.mono}>{txn.userId.slice(0, 8)}...</span>
                    <button
                        type="button"
                        className={styles.copyBtn}
                        onClick={(e) => handleCopy(e, txn.userId)}
                        title="Copy user ID"
                    >
                        {copiedId === txn.userId ? (
                            '✓'
                        ) : (
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                        )}
                    </button>
                </div>
            ),
        },
        {
            header: 'TYPE',
            render: (txn) => <TransactionTypeBadge type={txn.type} />,
        },
        {
            header: 'AMOUNT',
            render: (txn) =>
                txn.amount ? (
                    <span className={styles.amount}>{txn.amount.formatted}</span>
                ) : (
                    <span className={styles.dash}>&mdash;</span>
                ),
        },
        {
            header: 'CREDITS',
            render: (txn) => {
                if (txn.creditsDelta > 0) {
                    return <span className={styles.creditPositive}>+{txn.creditsDelta}</span>;
                }
                if (txn.creditsDelta < 0) {
                    return <span className={styles.creditNegative}>{txn.creditsDelta}</span>;
                }
                return <span className={styles.dash}>0</span>;
            },
        },
        {
            header: 'ENV',
            render: (txn) => <PaymentEnvironmentBadge environment={txn.environment} />,
        },
        {
            header: 'STATUS',
            render: (txn) => <TransactionStatusBadge status={txn.status} />,
        },
        {
            header: 'DATE',
            render: (txn) => (
                <span className={styles.dateCell}>
                    {new Date(txn.createdAt).toLocaleDateString()}{' '}
                    {new Date(txn.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            ),
        },
        {
            header: 'ACTIONS',
            render: (txn) => (
                <button
                    type="button"
                    className={styles.inspectBtn}
                    onClick={() => onSelectTransaction(txn)}
                    title="Inspect complete transaction audit record"
                >
                    Inspect
                </button>
            ),
        },
    ];

    return (
        <div className={styles.container}>
            <AdminTable
                columns={columns}
                data={transactions}
                keyExtractor={(txn) => txn.id}
                isLoading={isLoading}
                isFetching={isFetching}
                loadingMessage="FETCHING AUDIT LEDGER..."
                emptyMessage="NO BILLING TRANSACTIONS FOUND."
                onRowClick={onSelectTransaction}
            />

            <AdminPagination
                page={page}
                limit={limit}
                total={total}
                onPageChange={onPageChange}
                isLoading={isFetching}
            />
        </div>
    );
};
