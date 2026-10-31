import React from 'react';
import styles from './connections-pagination.module.css';

export interface ConnectionsPaginationProps {
    page: number;
    totalPages: number;
    onPageChange: (newPage: number) => void;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export const ConnectionsPagination: React.FC<ConnectionsPaginationProps> = ({
    page,
    totalPages,
    onPageChange,
    hasNextPage,
    hasPreviousPage,
}) => {
    if (totalPages <= 1) {
        return null;
    }

    // Generate visible page numbers with ellipsis
    const getPageNumbers = () => {
        const pages: (number | 'ellipsis')[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);
            if (page > 3) {
                pages.push('ellipsis');
            }

            const start = Math.max(2, page - 1);
            const end = Math.min(totalPages - 1, page + 1);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (page < totalPages - 2) {
                pages.push('ellipsis');
            }
            pages.push(totalPages);
        }

        return pages;
    };

    const pages = getPageNumbers();

    return (
        <nav className={styles.paginationContainer} aria-label="Pagination navigation">
            <button
                type="button"
                className={styles.navButton}
                disabled={!hasPreviousPage}
                onClick={() => onPageChange(page - 1)}
                aria-label="Go to previous page"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                </svg>
                <span>Previous</span>
            </button>

            <div className={styles.pageNumbersList}>
                {pages.map((p, index) => {
                    if (p === 'ellipsis') {
                        return (
                            <span key={`ellipsis-${index}`} className={styles.ellipsis}>
                                &hellip;
                            </span>
                        );
                    }

                    const isCurrent = p === page;

                    return (
                        <button
                            key={`page-${p}`}
                            type="button"
                            className={`${styles.pageButton} ${isCurrent ? styles.pageButtonActive : ''}`}
                            aria-current={isCurrent ? 'page' : undefined}
                            onClick={() => onPageChange(p)}
                        >
                            {p}
                        </button>
                    );
                })}
            </div>

            <button
                type="button"
                className={styles.navButton}
                disabled={!hasNextPage}
                onClick={() => onPageChange(page + 1)}
                aria-label="Go to next page"
            >
                <span>Next</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                </svg>
            </button>
        </nav>
    );
};

