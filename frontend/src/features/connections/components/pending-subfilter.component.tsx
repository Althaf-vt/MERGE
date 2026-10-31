import React from 'react';
import type { PendingDirectionFilter } from '../types/connections.types';
import styles from './pending-subfilter.module.css';

export interface PendingSubfilterProps {
    currentFilter: PendingDirectionFilter;
    onFilterChange: (filter: PendingDirectionFilter) => void;
    counts?: {
        all?: number;
        received?: number;
        sent?: number;
    };
    disabled?: boolean;
}

export const PendingSubfilter: React.FC<PendingSubfilterProps> = ({
    currentFilter,
    onFilterChange,
    counts,
    disabled = false,
}) => {
    const filters: { key: PendingDirectionFilter; label: string; count?: number }[] = [
        { key: 'ALL', label: 'All Pending', count: counts?.all },
        { key: 'RECEIVED', label: 'Received', count: counts?.received },
        { key: 'SENT', label: 'Sent', count: counts?.sent },
    ];

    return (
        <div className={styles.filterContainer} role="group" aria-label="Filter pending requests by direction">
            <div className={styles.pillsList}>
                {filters.map((f) => {
                    const isActive = currentFilter === f.key;

                    return (
                        <button
                            key={f.key}
                            type="button"
                            className={`${styles.filterPill} ${isActive ? styles.filterPillActive : ''}`}
                            onClick={() => onFilterChange(f.key)}
                            disabled={disabled}
                            aria-pressed={isActive}
                        >
                            <span className={styles.pillLabel}>{f.label}</span>
                            {typeof f.count === 'number' && (
                                <span className={`${styles.badge} ${isActive ? styles.badgeActive : ''}`}>
                                    {f.count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
