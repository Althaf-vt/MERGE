import React, { useState, useRef, useEffect } from 'react';
import type { SceneSessionDto } from '../types/scene-partner.types';
import styles from './simulation-chat.module.css';

export interface SimulationChatProps {
    session: SceneSessionDto;
    onSendMessage: (content: string) => Promise<boolean | void> | void;
    onPause: () => void;
    onResume: () => void;
    onEnd: () => void;
    onRestart?: () => void;
    onBack?: () => void;
    isSendingTurn?: boolean;
    isPausing?: boolean;
    isResuming?: boolean;
    isEnding?: boolean;
    formattedTime?: string;
    partnerName?: string;
}

export const SimulationChat: React.FC<SimulationChatProps> = ({
    session,
    onSendMessage,
    onPause,
    onResume,
    onEnd,
    onRestart,
    onBack,
    isSendingTurn = false,
    isPausing = false,
    isResuming = false,
    isEnding = false,
    partnerName,
}) => {
    const [inputValue, setInputValue] = useState('');
    const [savedNotice, setSavedNotice] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const isPaused = session.status === 'PAUSED';
    const isCompleted = session.status === 'COMPLETED';

    // Resolve active partner name
    const resolvedPartnerName =
        partnerName ||
        (session.simulationType === 'MATCH_BASED' ? 'Sarah' : 'Alex (Generic Partner)');

    const partnerInitial = resolvedPartnerName.charAt(0).toUpperCase();

    // Auto-scroll on new transcript entries or typing change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [session.transcript.length, isSendingTurn]);

    const handleSend = async () => {
        const text = inputValue.trim();
        if (!text || isSendingTurn || isPaused || isCompleted) return;
        setInputValue('');
        const success = await onSendMessage(text);
        if (success === false) {
            // Restore input text on failure so user does not lose message
            setInputValue(text);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSave = () => {
        setSavedNotice(true);
        setTimeout(() => setSavedNotice(false), 2500);
    };

    // Extract the latest turn with a coachNote for the sidebar insights
    const latestTurnWithCoachNote = [...session.transcript]
        .reverse()
        .find((t) => t.coachNote !== null && t.coachNote !== undefined);
    const latestCoachNote = latestTurnWithCoachNote?.coachNote;

    return (
        <div className={styles.simulationLayout}>
            {/* Left Sidebar (Partner Profile, Scenario Context & Coaching Insights) */}
            <aside className={styles.sidebar} aria-label="Simulation Context and Controls">
                {/* 1. Partner Profile Card */}
                <div className={styles.sidebarCard}>
                    <div className={styles.partnerProfileHeader}>
                        <div className={styles.partnerAvatarRing}>
                            <div className={styles.partnerAvatar}>
                                {partnerInitial}
                            </div>
                        </div>
                        <div className={styles.partnerInfo}>
                            <h3 className={styles.partnerName}>{resolvedPartnerName}</h3>
                            <span className={styles.compatibilityBadge}>
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                </svg>
                                92% Compatibility
                            </span>
                        </div>
                    </div>
                    <div className={styles.interestsSection}>
                        <span className={styles.sidebarSectionTitle}>INTERESTS</span>
                        <div className={styles.interestsTags}>
                            <span className={styles.interestTag}>Travel</span>
                            <span className={styles.interestTag}>Photography</span>
                            <span className={styles.interestTag}>Coffee</span>
                        </div>
                    </div>
                </div>

                {/* 2. Current Scenario Card */}
                <div className={styles.sidebarCard}>
                    <div className={styles.cardHeaderRow}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
                            <path d="M6 6h10"/>
                            <path d="M6 10h10"/>
                        </svg>
                        <span className={styles.sidebarSectionTitle}>CURRENT SCENARIO</span>
                    </div>
                    <h4 className={styles.scenarioCardTitle}>{session.scenarioTitle}</h4>
                    <p className={styles.scenarioCardDesc}>
                        Practice reaching out to a new match referencing their profile interests.
                    </p>
                    <div className={styles.difficultyPill}>DIFFICULTY: MEDIUM</div>
                    <p className={styles.scenarioCardNote}>
                        This simulation uses balanced responses and a natural conversation flow.
                    </p>
                </div>

                {/* 3. Active Coaching Toggle Card (Locked ON) */}
                <div className={styles.sidebarCard}>
                    <div className={styles.activeCoachingRow}>
                        <div className={styles.coachingIconBox}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/>
                                <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/>
                                <circle cx="12" cy="12" r="2"/>
                                <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/>
                                <path d="M19.1 4.9C23 8.8 23 15.2 19.1 19.1"/>
                            </svg>
                        </div>
                        <div className={styles.activeCoachingTexts}>
                            <span className={styles.activeCoachingTitle}>Active Coaching</span>
                            <span className={styles.activeCoachingSubtitle}>Real-time feedback</span>
                        </div>
                        <div className={styles.toggleSwitchLocked} title="Coaching mode is active">
                            <div className={styles.toggleKnob} />
                        </div>
                    </div>
                </div>

                {/* 4. Coaching Insights Card */}
                <div className={styles.sidebarCard}>
                    <div className={styles.insightsHeaderRow}>
                        <span className={styles.sidebarSectionTitle}>COACHING INSIGHTS</span>
                        <span className={styles.flowBadge}>
                            Flow: {latestCoachNote?.pacing || 'Natural'}
                        </span>
                    </div>
                    <ul className={styles.coachingTipsList}>
                        <li className={styles.coachingTipItem}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M9 18h6"/>
                                <path d="M10 22h4"/>
                                <path d="M12 2v1"/>
                                <path d="M12 7a5 5 0 0 0-5 5c0 2 1.5 3.5 2 4.5h6c.5-1 2-2.5 2-4.5a5 5 0 0 0-5-5z"/>
                            </svg>
                            <span>{latestCoachNote?.nextTip || 'Ask an open-ended follow-up question.'}</span>
                        </li>
                        <li className={styles.coachingTipItem}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M9 18h6"/>
                                <path d="M10 22h4"/>
                                <path d="M12 2v1"/>
                                <path d="M12 7a5 5 0 0 0-5 5c0 2 1.5 3.5 2 4.5h6c.5-1 2-2.5 2-4.5a5 5 0 0 0-5-5z"/>
                            </svg>
                            <span>Reference their profile interests to build shared momentum.</span>
                        </li>
                    </ul>
                </div>

                {/* 5. Session Actions */}
                <div className={styles.sidebarActionsBlock}>
                    <div className={styles.actionRowGrid}>
                        <button
                            type="button"
                            className={styles.sidebarActionBtn}
                            onClick={isPaused ? onResume : onPause}
                            disabled={isPausing || isResuming || isCompleted}
                        >
                            {isPaused ? (
                                <>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                    </svg>
                                    <span>Resume</span>
                                </>
                            ) : (
                                <>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                        <rect x="6" y="4" width="4" height="16"></rect>
                                        <rect x="14" y="4" width="4" height="16"></rect>
                                    </svg>
                                    <span>Pause</span>
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            className={styles.sidebarActionBtn}
                            onClick={onRestart}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                                <path d="M3 3v5h5"/>
                            </svg>
                            <span>Restart</span>
                        </button>

                        <button
                            type="button"
                            className={styles.sidebarActionBtn}
                            onClick={handleSave}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                                <polyline points="17 21 17 13 7 13 7 21"/>
                                <polyline points="7 3 7 8 15 8"/>
                            </svg>
                            <span>Save</span>
                        </button>
                    </div>

                    {savedNotice && (
                        <div className={styles.savedNotice}>Rehearsal progress saved!</div>
                    )}

                    <button
                        type="button"
                        className={styles.endSessionBtn}
                        onClick={onEnd}
                        disabled={isEnding || isCompleted}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                        <span>{isEnding ? 'Ending Rehearsal...' : 'End Session'}</span>
                    </button>
                </div>
            </aside>

            {/* Right Main Chat Pane */}
            <main className={styles.chatPane} aria-label="Conversation Rehearsal Thread">
                {/* Chat Header Bar */}
                <header className={styles.chatHeader}>
                    {onBack && (
                        <button type="button" className={styles.backLink} onClick={onBack}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="19" y1="12" x2="5" y2="12"></line>
                                <polyline points="12 19 5 12 12 5"></polyline>
                            </svg>
                            <span>Back to Scene Partner</span>
                        </button>
                    )}
                    <div className={styles.roleplayTitleRow}>
                        <h2 className={styles.roleplayTitle}>Roleplaying With: {resolvedPartnerName}</h2>
                        <span className={styles.simulationActiveBadge}>
                            <span className={styles.activeGreenDot} />
                            SIMULATION ACTIVE
                        </span>
                    </div>
                </header>

                {/* Messages Stream */}
                <div className={styles.messagesStream} role="log" aria-live="polite">
                    {/* Centered Scenario Start Divider */}
                    <div className={styles.scenarioDividerPill}>
                        Scenario Started: {session.scenarioTitle}
                    </div>

                    {session.transcript.map((turn, index) => {
                        const isUser = turn.role === 'USER';
                        const coachNote = turn.coachNote;

                        return (
                            <React.Fragment key={`${turn.role}-${index}-${turn.timestamp}`}>
                                <div className={isUser ? styles.userRow : styles.partnerRow}>
                                    {!isUser && (
                                        <div className={styles.chatPartnerAvatar}>
                                            {partnerInitial}
                                        </div>
                                    )}
                                    <div className={isUser ? styles.userBubble : styles.partnerBubble}>
                                        <p className={styles.bubbleText}>{turn.content}</p>
                                    </div>
                                </div>

                                {/* Inline Coach Feedback & Suggested Response (when present) */}
                                {coachNote && (
                                    <div className={styles.inlineCoachContainer}>
                                        {/* Inline Praise / Observation Pill */}
                                        <div className={styles.inlinePraisePill}>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                            <span>Great use of a shared interest.</span>
                                        </div>

                                        {/* Inline Coach Intervention Card */}
                                        <div className={styles.coachInterventionCard}>
                                            <div className={styles.coachInterventionHeader}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <circle cx="12" cy="12" r="10"></circle>
                                                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                                                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                                </svg>
                                                <span className={styles.coachInterventionTitle}>
                                                    Try asking an open-ended question
                                                </span>
                                            </div>
                                            <p className={styles.coachInterventionBody}>
                                                {coachNote.observation || coachNote.nextTip}
                                            </p>
                                        </div>

                                        {/* Inline Suggested Response Card */}
                                        <div className={styles.suggestedResponseCard}>
                                            <div className={styles.suggestedResponseHeader}>
                                                <div className={styles.suggestedResponseTitleRow}>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
                                                    </svg>
                                                    <span className={styles.suggestedResponseTitle}>Suggested Response</span>
                                                </div>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                                </svg>
                                            </div>
                                            <blockquote className={styles.suggestedResponseQuote}>
                                                &quot;{coachNote.nextTip}&quot;
                                            </blockquote>
                                            <div className={styles.suggestedResponseWhy}>
                                                <strong>Why This Works:</strong> Keeps conversational momentum and invites your partner to share stories rather than single-word answers.
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </React.Fragment>
                        );
                    })}

                    {/* Simulation Typing Indicator */}
                    {isSendingTurn && (
                        <div className={styles.partnerRow}>
                            <div className={styles.chatPartnerAvatar}>{partnerInitial}</div>
                            <div className={styles.typingBubble}>
                                <span className={styles.typingDot} />
                                <span className={styles.typingDot} />
                                <span className={styles.typingDot} />
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Message Input Bar */}
                <div className={styles.inputArea}>
                    <div className={styles.inputBar}>
                        <textarea
                            className={styles.chatTextarea}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type your response..."
                            disabled={isSendingTurn || isPaused || isCompleted}
                            rows={1}
                        />
                        <button
                            type="button"
                            className={styles.sendButton}
                            onClick={handleSend}
                            disabled={!inputValue.trim() || isSendingTurn || isPaused || isCompleted}
                            aria-label="Send response"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};
