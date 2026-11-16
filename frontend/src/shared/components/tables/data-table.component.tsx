import React from 'react';
import styles from './data-table.module.css';

export interface DataTableColumn<T> {
    id?: string;
    header: React.ReactNode;
    render: (item: T, index: number) => React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    headerStyle?: React.CSSProperties;
}

export interface DataTableProps<T> {
    columns: DataTableColumn<T>[];
    data: T[];
    keyExtractor: (item: T, index: number) => string;
    isLoading?: boolean;
    skeletonRowCount?: number;
    emptyTitle?: string;
    emptyDescription?: string;
    emptyIcon?: React.ReactNode;
    emptyStateNode?: React.ReactNode;
    // Pagination (optional - renders pagination footer if page, limit, and total are provided)
    page?: number;
    limit?: number;
    total?: number;
    onPageChange?: (newPage: number) => void;
    // Styling overrides (optional)
    wrapperClassName?: string;
    tableClassName?: string;
    onRowClick?: (item: T, index: number) => void;
}

export function DataTable<T>({
    columns,
    data,
    keyExtractor,
    isLoading = false,
    skeletonRowCount = 5,
    emptyTitle = 'No records found',
    emptyDescription = 'There are no items to display at this time.',
    emptyIcon,
    emptyStateNode,
    page,
    limit,
    total,
    onPageChange,
    wrapperClassName = '',
    tableClassName = '',
    onRowClick,
}: DataTableProps<T>): React.ReactElement {
    const isPaginationEnabled = page !== undefined && limit !== undefined && total !== undefined && onPageChange !== undefined;
    const totalPages = isPaginationEnabled ? Math.ceil(total / limit) || 1 : 1;
    const startIndex = isPaginationEnabled ? (total === 0 ? 0 : (page - 1) * limit + 1) : 1;
    const endIndex = isPaginationEnabled ? Math.min(page * limit, total) : data.length;

    return (
        <div className={`${styles.card} ${wrapperClassName}`.trim()}>
            <div className={styles.tableContainer}>
                <table className={`${styles.table} ${tableClassName}`.trim()}>
                    <thead>
                        <tr>
                            {columns.map((column, colIndex) => (
                                <th
                                    key={column.id || `col-${colIndex}`}
                                    className={`${styles.th} ${column.className || ''}`.trim()}
                                    style={column.headerStyle}
                                >
                                    {column.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            Array.from({ length: skeletonRowCount }).map((_, rowIndex) => (
                                <tr key={`skeleton-${rowIndex}`} className={styles.tr}>
                                    <td colSpan={columns.length} className={styles.td}>
                                        <div className={styles.skeletonRow} />
                                    </td>
                                </tr>
                            ))
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length}>
                                    {emptyStateNode || (
                                        <div className={styles.emptyState}>
                                            <div className={styles.emptyIcon}>
                                                {emptyIcon || (
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <rect x="2" y="4" width="20" height="16" rx="2" />
                                                        <line x1="2" y1="10" x2="22" y2="10" />
                                                    </svg>
                                                )}
                                            </div>
                                            <h4 className={styles.emptyTitle}>{emptyTitle}</h4>
                                            <p className={styles.emptyDescription}>{emptyDescription}</p>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ) : (
                            data.map((item, index) => (
                                <tr
                                    key={keyExtractor(item, index)}
                                    className={`${styles.tr} ${onRowClick ? styles.clickableRow : ''}`.trim()}
                                    onClick={() => onRowClick?.(item, index)}
                                >
                                    {columns.map((column, colIndex) => (
                                        <td
                                            key={column.id || `cell-${colIndex}`}
                                            className={`${styles.td} ${column.className || ''}`.trim()}
                                            style={column.style}
                                        >
                                            {column.render(item, index)}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {isPaginationEnabled && total > 0 && (
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
                                <polyline points="15 18 9 12 15 6" />
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
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
