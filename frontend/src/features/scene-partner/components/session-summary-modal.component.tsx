import React, { useEffect } from 'react';
import type { SceneSessionDto } from '../types/scene-partner.types';
import { SCENARIO_CATEGORY_LABELS } from '../constants/scene-partner.constants';
import styles from './session-summary-modal.module.css';

export interface SessionSummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    session: SceneSessionDto | null;
}

export const SessionSummaryModal: React.FC<SessionSummaryModalProps> = ({
    isOpen,
    onClose,
    session,
}) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen || !session || !session.summary) {
        return null;
    }

    const { summary } = session;
    const categoryLabel = SCENARIO_CATEGORY_LABELS[session.scenarioCategory] || session.scenarioCategory;

    const formattedDate = session.completedAt
        ? new Date(session.completedAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
        : 'Completed session';

    return (
        <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="summary-modal-title">
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <header className={styles.header}>
                    <div className={styles.headerLeft}>
                        <div className={styles.badgeRow}>
                            <span className={styles.categoryBadge}>{categoryLabel}</span>
                            <span className={styles.dateText}>{formattedDate}</span>
                        </div>
                        <h2 id="summary-modal-title" className={styles.title}>
                            {session.scenarioTitle}
                        </h2>
                    </div>

                    <button
                        type="button"
                        className={styles.closeButton}
                        onClick={onClose}
                        aria-label="Close summary modal"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </header>

                {/* Body */}
                <div className={styles.body}>
                    {/* Communication Score Banner */}
                    {typeof summary.communicationScore === 'number' && (
                        <div className={styles.scoreBanner}>
                            <div className={styles.scoreLeft}>
                                <h3 className={styles.scoreHeading}>Communication Score</h3>
                                <p className={styles.scoreDesc}>
                                    Assessed across engagement, conversational pacing, tone, and empathy.
                                </p>
                            </div>
                            <div className={styles.scoreValue}>
                                <span>{summary.communicationScore}</span>
                                <span className={styles.scoreTotal}>/100</span>
                            </div>
                        </div>
                    )}

                    {/* Overall Summary */}
                    {summary.summary && (
                        <section className={styles.section}>
                            <h4 className={styles.sectionTitle}>Overview</h4>
                            <p className={styles.summaryText}>{summary.summary}</p>
                        </section>
                    )}

                    {/* Key Takeaways */}
                    {summary.takeaways && summary.takeaways.length > 0 && (
                        <section className={styles.section}>
                            <h4 className={styles.sectionTitle}>Key Strengths</h4>
                            <ul className={styles.takeawayList}>
                                {summary.takeaways.map((item, idx) => (
                                    <li key={idx} className={styles.takeawayItem}>
                                        <svg className={styles.takeawayIcon} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                        </svg>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {/* Things to Note */}
                    {summary.thingsToNote && summary.thingsToNote.length > 0 && (
                        <section className={styles.section}>
                            <h4 className={styles.sectionTitle}>Areas for Improvement</h4>
                            <ul className={styles.noteList}>
                                {summary.thingsToNote.map((item, idx) => (
                                    <li key={idx} className={styles.noteItem}>
                                        <svg className={styles.noteIcon} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                                        </svg>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {/* Coach Synthesis */}
                    {summary.coachingNotes && (
                        <section className={styles.section}>
                            <h4 className={styles.sectionTitle}>Coach's Guidance</h4>
                            <div className={styles.coachingNotesText}>
                                {summary.coachingNotes}
                            </div>
                        </section>
                    )}
                </div>

                {/* Footer */}
                <footer className={styles.footer}>
                    <button
                        type="button"
                        className={styles.doneButton}
                        onClick={onClose}
                    >
                        Done
                    </button>
                </footer>
            </div>
        </div>
    );
};

