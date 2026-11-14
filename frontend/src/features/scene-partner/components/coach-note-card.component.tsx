import React, { useState } from 'react';
import type { CoachNoteDto } from '../types/scene-partner.types';
import styles from './coach-note-card.module.css';

export interface CoachNoteCardProps {
    coachNote: CoachNoteDto;
}

export const CoachNoteCard: React.FC<CoachNoteCardProps> = ({ coachNote }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <aside className={styles.coachCard} aria-label="Dating Coach Note">
            <div
                className={styles.headerRow}
                onClick={() => setIsExpanded((prev) => !prev)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setIsExpanded((prev) => !prev);
                    }
                }}
            >
                <div className={styles.badgeGroup}>
                    <span className={styles.coachBadge}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z" />
                        </svg>
                        Coach Tip
                    </span>
                    {!isExpanded && (
                        <span className={styles.tipSnippet}>{coachNote.nextTip}</span>
                    )}
                </div>

                <button
                    type="button"
                    className={styles.toggleButton}
                    aria-expanded={isExpanded}
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded((prev) => !prev);
                    }}
                >
                    <span>{isExpanded ? 'Hide' : 'Details'}</span>
                    <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        style={{
                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.15s ease',
                        }}
                    >
                        <path d="M7 10l5 5 5-5z" />
                    </svg>
                </button>
            </div>

            {isExpanded && (
                <div className={styles.detailsBody}>
                    <div className={styles.metaRow}>
                        <span className={styles.metaPill}>
                            <strong>Tone:</strong> {coachNote.tone}
                        </span>
                        <span className={styles.metaPill}>
                            <strong>Pacing:</strong> {coachNote.pacing}
                        </span>
                    </div>

                    <p className={styles.observationText}>
                        <strong>Observation:</strong> {coachNote.observation}
                    </p>

                    <div className={styles.tipBox}>
                        <strong>Suggested Next Move:</strong> {coachNote.nextTip}
                    </div>
                </div>
            )}
        </aside>
    );
};

