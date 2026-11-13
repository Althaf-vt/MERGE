import React, { useEffect, useState } from 'react';
import type { SceneSessionDto } from '../types/scene-partner.types';
import { toast } from '../../../shared/utils/toast.util';
import styles from './session-summary-modal.module.css';

export interface SessionSummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    session: SceneSessionDto | null;
    onPracticeAgain?: (session: SceneSessionDto) => void;
    onTryNewScenario?: () => void;
    onReturnToMatches?: () => void;
}

export const SessionSummaryModal: React.FC<SessionSummaryModalProps> = ({
    isOpen,
    onClose,
    session,
    onPracticeAgain,
    onTryNewScenario,
    onReturnToMatches,
}) => {
    const [savedInsight, setSavedInsight] = useState(false);

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
    const score = summary.communicationScore ?? 80;

    // Calculate score ring offset
    const radius = 32;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;

    // Calculate duration in minutes
    const calculateDuration = (): string => {
        if (!session.createdAt || !session.completedAt) return '8 Minutes';
        const totalMs =
            new Date(session.completedAt).getTime() -
            new Date(session.createdAt).getTime() -
            (session.totalPausedMs || 0);
        const mins = Math.max(1, Math.round(totalMs / 60000));
        return `${mins} Minute${mins > 1 ? 's' : ''}`;
    };

    const partnerName = session.simulationType === 'MATCH_BASED' ? 'Sarah' : 'Alex (Generic Partner)';

    // Extract replay exchanges with coach insights
    const replayExchanges = session.transcript
        .filter((t) => t.coachNote)
        .slice(0, 2);

    const firstUserTurn = session.transcript.find((t) => t.role === 'USER');

    const handleSaveInsight = () => {
        setSavedInsight(true);
        toast.success('Insights saved to your profile.');
        setTimeout(() => setSavedInsight(false), 2500);
    };

    return (
        <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="summary-title">
            <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <header className={styles.modalHeader}>
                    <button
                        type="button"
                        className={styles.closeBtn}
                        onClick={onClose}
                        aria-label="Close session summary"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>

                    <h1 id="summary-title" className={styles.title}>Session Summary</h1>
                    <p className={styles.subtitle}>
                        Review your practice session and discover ways to improve future conversations.
                    </p>

                    {/* Metadata Strip */}
                    <div className={styles.metadataStrip}>
                        <div className={styles.metaPill}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                            <span>Partner: {partnerName}</span>
                        </div>
                        <div className={styles.metaPill}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                            <span>Scenario: {session.scenarioTitle}</span>
                        </div>
                        <div className={styles.metaPill}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                            <span>Duration: {calculateDuration()}</span>
                        </div>
                    </div>
                </header>

                <div className={styles.bodyContent}>
                    {/* 1. Conversation Score Card */}
                    <section className={styles.scoreCard} aria-label="Conversation Score">
                        <div className={styles.scoreGaugeBox}>
                            <svg className={styles.gaugeSvg} width="76" height="76" viewBox="0 0 100 100" aria-hidden="true">
                                <circle
                                    cx="50"
                                    cy="50"
                                    r={radius}
                                    fill="none"
                                    stroke="#F3F4F6"
                                    strokeWidth="8"
                                />
                                <circle
                                    cx="50"
                                    cy="50"
                                    r={radius}
                                    fill="none"
                                    stroke="#7C3AED"
                                    strokeWidth="8"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={strokeDashoffset}
                                    strokeLinecap="round"
                                    transform="rotate(-90 50 50)"
                                />
                            </svg>
                            <div className={styles.scoreNumberOverlay}>
                                <span className={styles.scoreValueText}>{score}</span>
                                <span className={styles.scoreMaxText}>/100</span>
                            </div>
                        </div>

                        <div className={styles.scoreMetaColumn}>
                            <h2 className={styles.scoreHeading}>Conversation Score</h2>
                            <p className={styles.scoreDescriptionText}>
                                {summary.summary || 'Good progress. You maintained a natural conversation flow and showed genuine curiosity.'}
                            </p>
                        </div>
                    </section>

                    {/* 2. Conversation Replay Card */}
                    <section className={styles.replayCard} aria-labelledby="replay-heading">
                        <h2 id="replay-heading" className={styles.cardSectionTitle}>Conversation Replay</h2>
                        <div className={styles.replaySnippetList}>
                            {replayExchanges.length > 0 ? (
                                replayExchanges.map((turn, idx) => (
                                    <div key={idx} className={styles.replayBox}>
                                        <div className={styles.dialogueRow}>
                                            <span className={styles.dialogueSpeaker}>You:</span>
                                            <span className={styles.dialogueText}>&quot;{turn.content}&quot;</span>
                                        </div>
                                        {turn.coachNote && (
                                            <div className={styles.replayCoachNote}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                                    <circle cx="12" cy="12" r="10"/>
                                                    <path d="M12 16v-4"/>
                                                    <path d="M12 8h.01"/>
                                                </svg>
                                                <span>
                                                    <strong>Coach Insight:</strong> {turn.coachNote.observation || turn.coachNote.nextTip}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className={styles.replayBox}>
                                    {firstUserTurn ? (
                                        <>
                                            <div className={styles.dialogueRow}>
                                                <span className={styles.dialogueSpeaker}>You:</span>
                                                <span className={styles.dialogueText}>&quot;{firstUserTurn.content}&quot;</span>
                                            </div>
                                            <div className={styles.replayCoachNote}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                                    <circle cx="12" cy="12" r="10"/>
                                                    <path d="M12 16v-4"/>
                                                    <path d="M12 8h.01"/>
                                                </svg>
                                                <span>
                                                    No coaching interventions were triggered during this turn.
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        <p className={styles.emptyStateNotice}>
                                            No messages exchanged in this rehearsal.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* 3. Two-Column Comparison: What Went Well vs Opportunities */}
                    <div className={styles.twoColumnGrid}>
                        {/* What Went Well */}
                        <section className={styles.whatWentWellCard} aria-labelledby="well-heading">
                            <div className={styles.columnHeaderRow}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                                <h2 id="well-heading" className={styles.columnHeaderTitle}>What Went Well</h2>
                            </div>
                            <ul className={styles.bulletList}>
                                {summary.takeaways && summary.takeaways.length > 0 ? (
                                    summary.takeaways.map((item, i) => (
                                        <li key={i} className={styles.bulletItem}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                            <span>{item}</span>
                                        </li>
                                    ))
                                ) : (
                                    <li className={styles.bulletItem}>
                                        <span className={styles.emptyStateNotice}>No specific strengths recorded for this session.</span>
                                    </li>
                                )}
                            </ul>
                        </section>

                        {/* Opportunities For Improvement */}
                        <section className={styles.opportunitiesCard} aria-labelledby="opp-heading">
                            <div className={styles.columnHeaderRow}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                                    <line x1="12" y1="9" x2="12" y2="13"/>
                                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                                </svg>
                                <h2 id="opp-heading" className={styles.columnHeaderTitle}>Opportunities For Improvement</h2>
                            </div>
                            <ul className={styles.bulletList}>
                                {summary.thingsToNote && summary.thingsToNote.length > 0 ? (
                                    summary.thingsToNote.map((item, i) => (
                                        <li key={i} className={styles.bulletItem}>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="#D97706" aria-hidden="true">
                                                <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                            </svg>
                                            <span>{item}</span>
                                        </li>
                                    ))
                                ) : (
                                    <li className={styles.bulletItem}>
                                        <span className={styles.emptyStateNotice}>No improvement areas flagged.</span>
                                    </li>
                                )}
                            </ul>
                        </section>
                    </div>

                    {/* 4. Coach's Notes Card */}
                    <section className={styles.coachNotesCard} aria-labelledby="notes-heading">
                        <div className={styles.coachNotesHeader}>
                            <h2 id="notes-heading" className={styles.cardSectionTitle}>Coach&apos;s Notes</h2>
                            <button
                                type="button"
                                className={styles.saveInsightBtn}
                                onClick={handleSaveInsight}
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill={savedInsight ? '#7C3AED' : 'none'} stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                </svg>
                                <span>{savedInsight ? 'Saved!' : 'Save Insight'}</span>
                            </button>
                        </div>
                        <p className={styles.coachNotesText}>
                            {summary.coachingNotes || 'Great effort in completing this rehearsal session.'}
                        </p>
                    </section>

                    {/* 5. Action Buttons */}
                    <div className={styles.actionsBar}>
                        <button
                            type="button"
                            className={styles.practiceAgainBtn}
                            onClick={() => {
                                onClose();
                                onPracticeAgain?.(session);
                            }}
                        >
                            Practice Again
                        </button>
                        <button
                            type="button"
                            className={styles.tryNewBtn}
                            onClick={() => {
                                onClose();
                                onTryNewScenario?.();
                            }}
                        >
                            Try New Scenario
                        </button>
                        <button
                            type="button"
                            className={styles.returnMatchesBtn}
                            onClick={() => {
                                onClose();
                                onReturnToMatches?.();
                            }}
                        >
                            Return To Matches
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
