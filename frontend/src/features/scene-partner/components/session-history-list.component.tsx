import React from 'react';
import type { SceneSessionDto } from '../types/scene-partner.types';
import { SCENARIO_CATEGORY_LABELS } from '../constants/scene-partner.constants';
import styles from './session-history-list.module.css';

export interface SessionHistoryListProps {
    sessions: SceneSessionDto[];
    total: number;
    page: number;
    totalPages: number;
    onPageChange: (newPage: number) => void;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    isLoading: boolean;
    onViewSummary: (session: SceneSessionDto) => void;
}

export const SessionHistoryList: React.FC<SessionHistoryListProps> = ({
    sessions,
    page,
    totalPages,
    onPageChange,
    hasNextPage,
    hasPreviousPage,
    isLoading,
    onViewSummary,
}) => {
    if (isLoading) {
        return (
            <div className={styles.loadingWrapper} aria-busy="true">
                <div className={styles.spinner} />
                <span>Loading your practice history...</span>
            </div>
        );
    }

    if (sessions.length === 0) {
        return (
            <div className={styles.emptyState}>
                <div className={styles.emptyIcon} aria-hidden="true">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
                    </svg>
                </div>
                <h4 className={styles.emptyTitle}>No Practice Sessions Yet</h4>
                <p className={styles.emptyDescription}>
                    Completed practice sessions and coach debriefs will be archived here for your review.
                </p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.historyList} role="list" aria-label="Completed practice sessions">
                {sessions.map((session) => {
                    const categoryLabel = SCENARIO_CATEGORY_LABELS[session.scenarioCategory] || session.scenarioCategory;
                    const dateText = session.completedAt
                        ? new Date(session.completedAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                        })
                        : 'Completed';

                    const hasSummary = Boolean(session.summary);
                    const score = session.summary?.communicationScore;

                    return (
                        <article key={session.id} className={styles.historyItem} role="listitem">
                            <div className={styles.itemLeft}>
                                <div className={styles.badgeRow}>
                                    <span className={styles.categoryBadge}>{categoryLabel}</span>
                                    <span className={styles.simulationTypeBadge}>
                                        {session.simulationType === 'MATCH_BASED' ? 'Match Practice' : 'AI Partner'}
                                    </span>
                                    <span className={styles.metaText}>{dateText}</span>
                                    <span className={styles.metaText}>• {session.turnCount} turns</span>
                                </div>
                                <h4 className={styles.scenarioTitle}>{session.scenarioTitle}</h4>
                            </div>

                            <div className={styles.itemRight}>
                                {typeof score === 'number' && (
                                    <div className={styles.scoreBadge} title="Communication Score">
                                        <span>{score}</span>
                                        <span className={styles.scoreTotal}>/100</span>
                                    </div>
                                )}

                                {hasSummary && (
                                    <button
                                        type="button"
                                        className={styles.viewButton}
                                        onClick={() => onViewSummary(session)}
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                                        </svg>
                                        <span>View Debrief</span>
                                    </button>
                                )}
                            </div>
                        </article>
                    );
                })}
            </div>

            {totalPages > 1 && (
                <nav className={styles.paginationContainer} aria-label="Practice history pagination">
                    <button
                        type="button"
                        className={styles.navButton}
                        onClick={() => onPageChange(page - 1)}
                        disabled={!hasPreviousPage}
                    >
                        Previous
                    </button>
                    <span className={styles.pageIndicator}>
                        Page {page} of {totalPages}
                    </span>
                    <button
                        type="button"
                        className={styles.navButton}
                        onClick={() => onPageChange(page + 1)}
                        disabled={!hasNextPage}
                    >
                        Next
                    </button>
                </nav>
            )}
        </div>
    );
};

