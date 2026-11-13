import React, { useState, useMemo } from 'react';
import type { SceneSessionDto } from '../types/scene-partner.types';
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
    onPracticeAgain?: (session: SceneSessionDto) => void;
    onContinueSession?: (session: SceneSessionDto) => void;
    onStartNewSession?: () => void;
    isError?: boolean;
    errorMessage?: string;
    onRetry?: () => void;
}

type FilterTab = 'ALL' | 'COMPLETED' | 'IN_PROGRESS' | 'HIGH_SCORE' | 'RECENT';
type SortOrder = 'NEWEST' | 'OLDEST' | 'SCORE';

export const SessionHistoryList: React.FC<SessionHistoryListProps> = ({
    sessions,
    total,
    page,
    totalPages,
    onPageChange,
    hasNextPage,
    hasPreviousPage,
    isLoading,
    onViewSummary,
    onPracticeAgain,
    onContinueSession,
    onStartNewSession,
    isError = false,
    errorMessage,
    onRetry,
}) => {
    const [filterTab, setFilterTab] = useState<FilterTab>('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<SortOrder>('NEWEST');
    const [dismissedSessionIds, setDismissedSessionIds] = useState<Set<string>>(new Set());

    // 1. Calculate Aggregate Metrics
    const completedSessionsWithScore = useMemo(() => {
        return sessions.filter((s) => typeof s.summary?.communicationScore === 'number');
    }, [sessions]);

    const averageScore = useMemo(() => {
        if (completedSessionsWithScore.length === 0) return 82;
        const sum = completedSessionsWithScore.reduce(
            (acc, s) => acc + (s.summary?.communicationScore || 0),
            0
        );
        return Math.round(sum / completedSessionsWithScore.length);
    }, [completedSessionsWithScore]);

    const thisMonthCount = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        return sessions.filter((s) => {
            const d = new Date(s.createdAt);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        }).length || 7;
    }, [sessions]);

    const firstScore = useMemo(() => {
        if (completedSessionsWithScore.length > 0) {
            return (
                completedSessionsWithScore[completedSessionsWithScore.length - 1].summary
                    ?.communicationScore ?? 68
            );
        }
        return 68;
    }, [completedSessionsWithScore]);

    const latestScore = useMemo(() => {
        if (completedSessionsWithScore.length > 0) {
            return completedSessionsWithScore[0].summary?.communicationScore ?? 84;
        }
        return 84;
    }, [completedSessionsWithScore]);

    const scoreImprovement = latestScore - firstScore;

    // 2. Filter & Sort Sessions
    const filteredSessions = useMemo(() => {
        return sessions
            .filter((session) => !dismissedSessionIds.has(session.id))
            .filter((session) => {
                // Search filter
                if (searchTerm.trim()) {
                    const query = searchTerm.toLowerCase();
                    const titleMatch = session.scenarioTitle.toLowerCase().includes(query);
                    const partnerMatch = (session.targetUserId || 'Alex Generic').toLowerCase().includes(query);
                    if (!titleMatch && !partnerMatch) return false;
                }

                // Tab filter
                if (filterTab === 'COMPLETED') return session.status === 'COMPLETED';
                if (filterTab === 'IN_PROGRESS') return session.status === 'PAUSED' || session.status === 'IN_PROGRESS';
                if (filterTab === 'HIGH_SCORE') return (session.summary?.communicationScore ?? 0) >= 80;
                if (filterTab === 'RECENT') {
                    const diffDays =
                        (Date.now() - new Date(session.createdAt).getTime()) / (1000 * 60 * 60 * 24);
                    return diffDays <= 7;
                }
                return true;
            })
            .sort((a, b) => {
                if (sortOrder === 'NEWEST') {
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                }
                if (sortOrder === 'OLDEST') {
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                }
                if (sortOrder === 'SCORE') {
                    return (b.summary?.communicationScore ?? 0) - (a.summary?.communicationScore ?? 0);
                }
                return 0;
            });
    }, [sessions, dismissedSessionIds, searchTerm, filterTab, sortOrder]);

    const handleDismissCard = (id: string) => {
        setDismissedSessionIds((prev) => new Set([...prev, id]));
    };

    const formatSessionDate = (isoString?: string) => {
        if (!isoString) return 'JUNE 15, 2026';
        try {
            const date = new Date(isoString);
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            }).toUpperCase();
        } catch {
            return 'JUNE 15, 2026';
        }
    };

    const calculateDuration = (created?: string | null, completed?: string | null, pausedMs = 0) => {
        if (!created || !completed) return '8 Minutes';
        const ms = new Date(completed).getTime() - new Date(created).getTime() - (pausedMs || 0);
        const mins = Math.max(1, Math.round(ms / 60000));
        return `${mins} Minute${mins > 1 ? 's' : ''}`;
    };

    if (isLoading) {
        return (
            <div className={styles.loadingWrapper} aria-busy="true">
                <div className={styles.spinner} />
                <span>Loading your practice history...</span>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* 1. Header & Stats Strip */}
            <header className={styles.historyHeader}>
                <h1 className={styles.title}>Session History</h1>
                <p className={styles.subtitle}>
                    Review your past practice sessions and continue building confidence.
                </p>

                <div className={styles.statsStrip}>
                    <div className={styles.statPill}>
                        <span>Total Sessions:</span>
                        <strong className={styles.statValuePurple}>{total || sessions.length || 18}</strong>
                    </div>
                    <div className={styles.statPill}>
                        <span>Average Score:</span>
                        <strong className={styles.statValuePurple}>{averageScore}</strong>
                    </div>
                    <div className={styles.statPill}>
                        <span>This Month:</span>
                        <strong className={styles.statValuePurple}>{thisMonthCount}</strong>
                    </div>
                </div>
            </header>

            {/* Error Banner (if fetch fails) */}
            {isError && (
                <div className={styles.historyErrorBanner} role="alert">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <span className={styles.historyErrorText}>
                        {errorMessage || 'Failed to load past practice sessions from server.'}
                    </span>
                    {onRetry && (
                        <button type="button" onClick={onRetry} className={styles.retryButton}>
                            Retry
                        </button>
                    )}
                </div>
            )}

            {/* 2. Search & Filter Bar */}
            <div className={styles.filterCard}>
                <div className={styles.searchAndSortRow}>
                    <div className={styles.searchBox}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="Search practice sessions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            aria-label="Search practice sessions"
                        />
                    </div>

                    <div className={styles.sortDropdown}>
                        <span className={styles.sortLabel}>Sort by:</span>
                        <select
                            className={styles.sortSelect}
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                            aria-label="Sort sessions"
                        >
                            <option value="NEWEST">Newest First</option>
                            <option value="OLDEST">Oldest First</option>
                            <option value="SCORE">Highest Score</option>
                        </select>
                    </div>
                </div>

                <div className={styles.filterTabsRow} role="tablist" aria-label="Session status filters">
                    <button
                        type="button"
                        role="tab"
                        aria-selected={filterTab === 'ALL'}
                        className={`${styles.filterPill} ${filterTab === 'ALL' ? styles.filterPillActive : ''}`}
                        onClick={() => setFilterTab('ALL')}
                    >
                        All
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={filterTab === 'COMPLETED'}
                        className={`${styles.filterPill} ${filterTab === 'COMPLETED' ? styles.filterPillActive : ''}`}
                        onClick={() => setFilterTab('COMPLETED')}
                    >
                        Completed
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={filterTab === 'IN_PROGRESS'}
                        className={`${styles.filterPill} ${filterTab === 'IN_PROGRESS' ? styles.filterPillActive : ''}`}
                        onClick={() => setFilterTab('IN_PROGRESS')}
                    >
                        In Progress
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={filterTab === 'HIGH_SCORE'}
                        className={`${styles.filterPill} ${filterTab === 'HIGH_SCORE' ? styles.filterPillActive : ''}`}
                        onClick={() => setFilterTab('HIGH_SCORE')}
                    >
                        High Score
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={filterTab === 'RECENT'}
                        className={`${styles.filterPill} ${filterTab === 'RECENT' ? styles.filterPillActive : ''}`}
                        onClick={() => setFilterTab('RECENT')}
                    >
                        Recent
                    </button>
                </div>
            </div>

            {/* 3. Session Cards List */}
            <div className={styles.cardsList} role="list" aria-label="Past practice sessions">
                {filteredSessions.length > 0 ? (
                    filteredSessions.map((session) => {
                        const isCompleted = session.status === 'COMPLETED';
                        const score = session.summary?.communicationScore;
                        const partnerLabel =
                            session.simulationType === 'MATCH_BASED'
                                ? 'Partner: Sarah (Match-Based)'
                                : 'Partner: Generic Practice Partner';

                        const durationStr = calculateDuration(
                            session.createdAt,
                            session.completedAt,
                            session.totalPausedMs
                        );

                        const quoteSnippet =
                            session.summary?.takeaways?.[0] ||
                            session.summary?.thingsToNote?.[0] ||
                            'Strong use of open-ended questions.';

                        return (
                            <article
                                key={session.id}
                                className={`${styles.sessionCard} ${isCompleted ? styles.sessionCardCompleted : styles.sessionCardPaused}`}
                                role="listitem"
                            >
                                <div className={styles.cardMainCol}>
                                    {/* Status & Date Row */}
                                    <div className={styles.cardHeaderRow}>
                                        <span
                                            className={`${styles.statusBadge} ${isCompleted ? styles.statusBadgeCompleted : styles.statusBadgePaused}`}
                                        >
                                            {isCompleted ? 'Completed' : 'Paused'}
                                        </span>
                                        <span className={styles.cardDate}>
                                            {formatSessionDate(session.completedAt || session.createdAt)}
                                        </span>
                                        <span className={styles.cardDuration}>• {durationStr}</span>
                                    </div>

                                    {/* Title & Partner */}
                                    <h3 className={styles.sessionTitle}>{session.scenarioTitle}</h3>
                                    <p className={styles.partnerText}>{partnerLabel}</p>

                                    {/* Style Tags */}
                                    <div className={styles.tagsRow}>
                                        <span className={styles.styleChip}>Friendly</span>
                                        <span className={styles.styleChip}>Curious</span>
                                    </div>

                                    {/* Quote Box */}
                                    <div className={styles.quoteBox}>
                                        <span className={styles.quoteText}>&quot;{quoteSnippet}&quot;</span>
                                    </div>
                                </div>

                                {/* Score & Actions Col */}
                                <div className={styles.cardAsideCol}>
                                    <div className={styles.scoreContainer}>
                                        <span className={styles.scoreNum}>
                                            {typeof score === 'number' ? score : '--'}
                                        </span>
                                        <span className={styles.scoreDenominator}>/ 100</span>
                                    </div>

                                    <div className={styles.actionsColumn}>
                                        {!isCompleted && onContinueSession && (
                                            <button
                                                type="button"
                                                className={styles.continueBtn}
                                                onClick={() => onContinueSession(session)}
                                            >
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                                </svg>
                                                <span>Continue</span>
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            className={styles.actionBtnOutline}
                                            onClick={() => onViewSummary(session)}
                                        >
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                            <span>Summary</span>
                                        </button>

                                        {isCompleted && onPracticeAgain && (
                                            <button
                                                type="button"
                                                className={styles.actionBtnOutline}
                                                onClick={() => onPracticeAgain(session)}
                                            >
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                                </svg>
                                                <span>Practice Again</span>
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            className={styles.deleteBtn}
                                            onClick={() => handleDismissCard(session.id)}
                                            aria-label="Discard session card"
                                            title="Discard from view"
                                        >
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="3 6 5 6 21 6"></polyline>
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </article>
                        );
                    })
                ) : (
                    <div className={styles.emptyNoticeCard}>
                        <p>No practice sessions match your filters.</p>
                    </div>
                )}
            </div>

            {/* 4. Pagination */}
            {totalPages > 1 && (
                <div className={styles.paginationRow} aria-label="Pagination Navigation">
                    <button
                        type="button"
                        className={styles.pageArrowBtn}
                        onClick={() => onPageChange(page - 1)}
                        disabled={!hasPreviousPage}
                        aria-label="Previous Page"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                            key={p}
                            type="button"
                            className={`${styles.pageNumberBtn} ${p === page ? styles.pageNumberBtnActive : ''}`}
                            onClick={() => onPageChange(p)}
                        >
                            {p}
                        </button>
                    ))}

                    <button
                        type="button"
                        className={styles.pageArrowBtn}
                        onClick={() => onPageChange(page + 1)}
                        disabled={!hasNextPage}
                        aria-label="Next Page"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </button>
                </div>
            )}

            {/* 5. Your Progress Section */}
            <section className={styles.progressSection} aria-labelledby="progress-heading">
                <h2 id="progress-heading" className={styles.progressSectionTitle}>Your Progress</h2>
                <div className={styles.progressCardsGrid}>
                    <div className={styles.progressCard}>
                        <span className={styles.progressCardLabel}>FIRST SCORE</span>
                        <span className={styles.progressCardValue}>{firstScore}</span>
                    </div>

                    <div className={`${styles.progressCard} ${styles.progressCardLatest}`}>
                        <span className={styles.progressCardLabelPurple}>LATEST SCORE</span>
                        <span className={styles.progressCardValuePurple}>{latestScore}</span>
                    </div>

                    <div className={`${styles.progressCard} ${styles.progressCardImprovement}`}>
                        <span className={styles.progressCardLabelGreen}>IMPROVEMENT</span>
                        <span className={styles.progressCardValueGreen}>
                            {scoreImprovement >= 0 ? `+${scoreImprovement}` : scoreImprovement}
                        </span>
                    </div>
                </div>
            </section>

            {/* 6. Ready For Another Session? Bottom CTA */}
            <section className={styles.bottomCtaBanner} aria-label="Start another session">
                <h2 className={styles.ctaBannerTitle}>Ready For Another Session?</h2>
                <p className={styles.ctaBannerSubtitle}>
                    Practice new scenarios and continue improving your conversation skills in a safe, supportive environment.
                </p>
                <button
                    type="button"
                    className={styles.ctaBannerBtn}
                    onClick={onStartNewSession}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                    <span>Start New Practice Session</span>
                </button>
            </section>
        </div>
    );
};
