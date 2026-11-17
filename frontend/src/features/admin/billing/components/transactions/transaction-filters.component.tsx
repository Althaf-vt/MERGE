import React from 'react';
import type {
    BillingTransactionType,
    TransactionStatus,
} from '../../types/admin-billing.types';
import {
    TRANSACTION_STATUS_FILTER_OPTIONS,
    TRANSACTION_TYPE_FILTER_OPTIONS,
} from '../../constants/admin-billing.constants';
import styles from './transaction-filters.module.css';

export interface TransactionFiltersProps {
    userId: string;
    type: BillingTransactionType | '';
    status: TransactionStatus | '';
    fromDate: string;
    toDate: string;
    onUserIdChange: (val: string) => void;
    onTypeChange: (val: BillingTransactionType | '') => void;
    onStatusChange: (val: TransactionStatus | '') => void;
    onFromDateChange: (val: string) => void;
    onToDateChange: (val: string) => void;
    onResetFilters: () => void;
    hasActiveFilters: boolean;
}

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
    userId,
    type,
    status,
    fromDate,
    toDate,
    onUserIdChange,
    onTypeChange,
    onStatusChange,
    onFromDateChange,
    onToDateChange,
    onResetFilters,
    hasActiveFilters,
}) => {
    return (
        <div className={styles.toolbar}>
            <div className={styles.filtersLeft}>
                <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Search by User ID..."
                    value={userId}
                    onChange={(e) => onUserIdChange(e.target.value)}
                    aria-label="Filter by User ID"
                />

                <select
                    className={styles.select}
                    value={type}
                    onChange={(e) =>
                        onTypeChange(e.target.value as BillingTransactionType | '')
                    }
                    aria-label="Filter by Transaction Type"
                >
                    {TRANSACTION_TYPE_FILTER_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>

                <select
                    className={styles.select}
                    value={status}
                    onChange={(e) =>
                        onStatusChange(e.target.value as TransactionStatus | '')
                    }
                    aria-label="Filter by Status"
                >
                    {TRANSACTION_STATUS_FILTER_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>

                <div className={styles.dateRangeGroup}>
                    <span className={styles.dateLabel}>From:</span>
                    <input
                        type="date"
                        className={styles.dateInput}
                        value={fromDate}
                        onChange={(e) => onFromDateChange(e.target.value)}
                        aria-label="Filter From Date"
                    />
                </div>

                <div className={styles.dateRangeGroup}>
                    <span className={styles.dateLabel}>To:</span>
                    <input
                        type="date"
                        className={styles.dateInput}
                        value={toDate}
                        onChange={(e) => onToDateChange(e.target.value)}
                        aria-label="Filter To Date"
                    />
                </div>
            </div>

            {hasActiveFilters && (
                <button
                    type="button"
                    className={styles.resetBtn}
                    onClick={onResetFilters}
                    title="Reset all filters"
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    Clear Filters
                </button>
            )}
        </div>
    );
};
