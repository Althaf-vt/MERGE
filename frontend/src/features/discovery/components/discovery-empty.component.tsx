import React from 'react';
import styles from './discovery-empty.module.css';

export interface DiscoveryEmptyProps {
    onRefresh?: () => void;
    onOpenFilters?: () => void;
    onResetFilters?: () => void;
    isRefreshing?: boolean;
    isFilterActive?: boolean;
}

export const DiscoveryEmpty: React.FC<DiscoveryEmptyProps> = ({
    onRefresh,
    onOpenFilters,
    onResetFilters,
    isRefreshing = false,
    isFilterActive = false,
}) => {
    return (
        <section className={styles.emptyContainer} aria-label="End of discovery feed">
            <div className={styles.radarWrapper}>
                <div className={styles.radarCircleOuter} />
                <div className={styles.radarCircleInner} />
                <svg
                    className={styles.icon}
                    width="36"
                    height="36"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
            </div>

            <div className={styles.textSection}>
                <h2 className={styles.title}>
                    {isFilterActive ? 'No Matches Found' : 'You\u2019ve caught up.'}
                </h2>
                <p className={styles.description}>
                    {isFilterActive
                        ? 'No profiles match your active filter settings. Try expanding your search scope or clearing filters.'
                        : 'You\u2019ve reviewed all available profiles that match your exact vector. We\u2019ll notify you when new souls join.'}
                </p>
            </div>

            <div className={styles.actionsRow}>
                {onOpenFilters && (
                    <button
                        type="button"
                        onClick={onOpenFilters}
                        className={styles.primaryButton}
                    >
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1="4" y1="21" x2="4" y2="14" />
                            <line x1="4" y1="10" x2="4" y2="3" />
                            <line x1="12" y1="21" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12" y2="3" />
                            <line x1="20" y1="21" x2="20" y2="16" />
                            <line x1="20" y1="12" x2="20" y2="3" />
                            <line x1="1" y1="14" x2="7" y2="14" />
                            <line x1="9" y1="8" x2="15" y2="8" />
                            <line x1="17" y1="16" x2="23" y2="16" />
                        </svg>
                        <span>{isFilterActive ? 'Adjust Filters' : 'Broaden Search Filters'}</span>
                    </button>
                )}

                {isFilterActive && onResetFilters && (
                    <button
                        type="button"
                        onClick={onResetFilters}
                        className={styles.secondaryButton}
                    >
                        Reset All Filters
                    </button>
                )}

                {onRefresh && !isFilterActive && (
                    <button
                        type="button"
                        onClick={onRefresh}
                        className={styles.secondaryButton}
                        disabled={isRefreshing}
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <polyline points="23 4 23 10 17 10" />
                            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                        </svg>
                        <span>{isRefreshing ? 'Checking for updates...' : 'Refresh Feed'}</span>
                    </button>
                )}
            </div>
        </section>
    );
};
