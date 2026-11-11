import React from 'react';
import styles from './admin-pagination.module.css';

export interface AdminPaginationProps {
    page: number;
    limit: number;
    total: number;
    onPageChange: (newPage: number) => void;
    isLoading?: boolean;
    className?: string;
}

export const AdminPagination: React.FC<AdminPaginationProps> = ({
    page,
    limit,
    total,
    onPageChange,
    isLoading = false,
    className = '',
}) => {
    if (total <= 0) {
        return null;
    }

    const totalPages = Math.max(1, Math.ceil(total / limit));
    const startItem = (page - 1) * limit + 1;
    const endItem = Math.min(page * limit, total);

    return (
        <nav
            className={`${styles.pagination} ${className}`.trim()}
            aria-label="Admin pagination navigation"
        >
            <span className={styles.info}>
                DISPLAYING {startItem} - {endItem} OF {total}
            </span>
            <div className={styles.pageControls}>
                <button
                    type="button"
                    className={styles.actionBtn}
                    disabled={page <= 1 || isLoading}
                    onClick={() => onPageChange(page - 1)}
                    aria-label="Previous page"
                >
                    PREV
                </button>
                <button
                    type="button"
                    className={styles.actionBtn}
                    disabled={page >= totalPages || isLoading}
                    onClick={() => onPageChange(page + 1)}
                    aria-label="Next page"
                >
                    NEXT
                </button>
            </div>
        </nav>
    );
};

