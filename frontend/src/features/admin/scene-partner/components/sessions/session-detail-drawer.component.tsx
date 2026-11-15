import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGetAdminSessionDetailsQuery } from '../../api/admin-scene-partner.api';
import { SCENE_SESSION_STATUS_LABELS } from '../../constants/admin-scene-partner.constants';
import styles from './session-detail-drawer.module.css';

export interface SessionDetailDrawerProps {
    isOpen: boolean;
    sessionId: string | null;
    onClose: () => void;
}

type DrawerTab = 'TRANSCRIPT' | 'METRICS';

export const SessionDetailDrawer: React.FC<SessionDetailDrawerProps> = ({
    isOpen,
    sessionId,
    onClose,
}) => {
    const [activeTab, setActiveTab] = useState<DrawerTab>('TRANSCRIPT');

    const { data, isLoading } = useGetAdminSessionDetailsQuery(sessionId ?? '', {
        skip: !sessionId || !isOpen,
    });

    const session = data?.data;

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        window.addEventListener('keydown', handleKeyDown);
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = originalOverflow;
        };
    }, [isOpen, onClose]);

    if (!isOpen || !sessionId) return null;

    const formatDuration = (minutes?: number) => {
        if (!minutes || minutes <= 0) return '0s';
        const mins = Math.floor(minutes);
        const secs = Math.round((minutes % 1) * 60);
        return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    };

    const getStatusDotClass = (status?: string) => {
        switch (status) {
            case 'COMPLETED':
                return styles.statusCompleted;
            case 'IN_PROGRESS':
                return styles.statusInProgress;
            case 'PAUSED':
                return styles.statusPaused;
            default:
                return '';
        }
    };

    return (
        <AnimatePresence>
            <div className={styles.backdrop} onClick={onClose}>
                <motion.div
                    className={styles.drawer}
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                    onClick={(e) => e.stopPropagation()}
                    role="dialog"
                    aria-modal="true"
                    aria-label={`Session audit for ${sessionId}`}
                >
                    <div className={styles.header}>
                        <div className={styles.titleArea}>
                            <h2 className={styles.sessionTitle}>{sessionId}</h2>
                            <div className={styles.headerMeta}>
                                <div className={styles.statusWrapper}>
                                    <span
                                        className={`${styles.statusDot} ${getStatusDotClass(session?.status)}`}
                                    />
                                    <span>
                                        {session ? SCENE_SESSION_STATUS_LABELS[session.status] || session.status : 'Loading...'}
                                    </span>
                                </div>
                                {session && <span>• {new Date(session.createdAt).toLocaleString()}</span>}
                            </div>
                        </div>
                        <button
                            type="button"
                            className={styles.closeBtn}
                            onClick={onClose}
                            title="Close drawer (Esc)"
                            aria-label="Close drawer"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>

                    <div className={styles.tabBar}>
                        <button
                            type="button"
                            className={`${styles.tabBtn} ${activeTab === 'TRANSCRIPT' ? styles.tabBtnActive : ''}`}
                            onClick={() => setActiveTab('TRANSCRIPT')}
                        >
                            Dialogue Transcript
                        </button>
                        <button
                            type="button"
                            className={`${styles.tabBtn} ${activeTab === 'METRICS' ? styles.tabBtnActive : ''}`}
                            onClick={() => setActiveTab('METRICS')}
                        >
                            Telemetry & Timeline
                        </button>
                    </div>

                    <div className={styles.body}>
                        {isLoading ? (
                            <div className={styles.emptyState}>LOADING REHEARSAL TELEMETRY...</div>
                        ) : !session ? (
                            <div className={styles.emptyState}>SESSION DETAILS NOT FOUND.</div>
                        ) : (
                            <>
                                <div className={styles.sessionOverview}>
                                    <div className={styles.overviewItem}>
                                        <span className={styles.overviewLabel}>Target User ID</span>
                                        <span className={styles.overviewVal}>{session.userId}</span>
                                    </div>
                                    <div className={styles.overviewItem}>
                                        <span className={styles.overviewLabel}>Scenario</span>
                                        <span className={styles.overviewVal}>{session.scenarioTitle}</span>
                                    </div>
                                    <div className={styles.overviewItem}>
                                        <span className={styles.overviewLabel}>Simulation Type</span>
                                        <span className={styles.overviewVal}>
                                            {session.simulationType === 'MATCH_BASED' ? 'Match Based' : 'Generic'}
                                        </span>
                                    </div>
                                    <div className={styles.overviewItem}>
                                        <span className={styles.overviewLabel}>Coaching Mode</span>
                                        <span className={styles.overviewVal}>
                                            {session.isCoachingEnabled ? 'Enabled' : 'Disabled'}
                                        </span>
                                    </div>
                                </div>

                                {activeTab === 'TRANSCRIPT' && (
                                    <div className={styles.transcriptStream}>
                                        {!session.transcript || session.transcript.length === 0 ? (
                                            <div className={styles.emptyState}>
                                                NO RECORDED DIALOGUE TURNS IN THIS SESSION.
                                            </div>
                                        ) : (
                                            session.transcript.map((turn, index) => {
                                                const isUser = turn.role === 'USER';
                                                return (
                                                    <div
                                                        key={`turn-${index}`}
                                                        className={`${styles.messageRow} ${
                                                            isUser ? styles.userRow : styles.simulationRow
                                                        }`}
                                                    >
                                                        <div className={styles.messageMeta}>
                                                            <span>{isUser ? 'USER' : 'AI PARTNER'}</span>
                                                            <span>• {new Date(turn.timestamp).toLocaleTimeString()}</span>
                                                        </div>

                                                        <div
                                                            className={`${styles.messageBubble} ${
                                                                isUser ? styles.userBubble : styles.simulationBubble
                                                            }`}
                                                        >
                                                            {turn.content}
                                                        </div>

                                                        {isUser && turn.coachNote && (
                                                            <div className={styles.coachNoteCard}>
                                                                <div className={styles.coachHeader}>
                                                                    <span>Coach Evaluation</span>
                                                                </div>
                                                                {turn.coachNote.observation && (
                                                                    <div className={styles.coachItem}>
                                                                        <span className={styles.coachLabel}>Observation</span>
                                                                        <span className={styles.coachText}>
                                                                            {turn.coachNote.observation}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                <div style={{ display: 'flex', gap: '16px' }}>
                                                                    {turn.coachNote.tone && (
                                                                        <div className={styles.coachItem}>
                                                                            <span className={styles.coachLabel}>Tone</span>
                                                                            <span className={styles.coachText}>
                                                                                {turn.coachNote.tone}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                    {turn.coachNote.pacing && (
                                                                        <div className={styles.coachItem}>
                                                                            <span className={styles.coachLabel}>Pacing</span>
                                                                            <span className={styles.coachText}>
                                                                                {turn.coachNote.pacing}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                {turn.coachNote.nextTip && (
                                                                    <div className={styles.coachItem}>
                                                                        <span className={styles.coachLabel}>Suggested Next Tip</span>
                                                                        <span className={styles.coachText}>
                                                                            {turn.coachNote.nextTip}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                )}

                                {activeTab === 'METRICS' && (
                                    <>
                                        <div className={styles.telemetryGrid}>
                                            <div className={styles.telemetryTile}>
                                                <span className={styles.telemetryLabel}>Total Duration</span>
                                                <span className={styles.telemetryValue}>
                                                    {formatDuration(session.telemetry?.durationMinutes)}
                                                </span>
                                            </div>
                                            <div className={styles.telemetryTile}>
                                                <span className={styles.telemetryLabel}>Turn Count</span>
                                                <span className={styles.telemetryValue}>
                                                    {session.turnCount}
                                                </span>
                                            </div>
                                            <div className={styles.telemetryTile}>
                                                <span className={styles.telemetryLabel}>Coaching Interventions</span>
                                                <span className={styles.telemetryValue}>
                                                    {session.telemetry?.coachingInterventionCount ?? 0}
                                                </span>
                                            </div>
                                            <div className={styles.telemetryTile}>
                                                <span className={styles.telemetryLabel}>Paused Time</span>
                                                <span className={styles.telemetryValue}>
                                                    {Math.round((session.totalPausedMs ?? 0) / 1000)}s
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className={styles.overviewLabel} style={{ marginBottom: '12px' }}>
                                                Lifecycle Timeline Events
                                            </h3>
                                            {!session.timeline || session.timeline.length === 0 ? (
                                                <div className={styles.emptyState}>NO LIFECYCLE EVENTS RECORDED.</div>
                                            ) : (
                                                <div className={styles.timelineList}>
                                                    {session.timeline.map((evt, idx) => (
                                                        <div key={evt.id || `evt-${idx}`} className={styles.timelineEvent}>
                                                            <div className={styles.timelineDot} />
                                                            <span className={styles.timelineTitle}>
                                                                {evt.eventType.replace(/_/g, ' ')}
                                                            </span>
                                                            <span className={styles.timelineTime}>
                                                                {new Date(evt.timestamp).toLocaleString()}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
