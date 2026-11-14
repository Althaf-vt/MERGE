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

interface InlineCoachCardProps {
    variant: 'observation' | 'recommendation';
    title: string;
    icon: React.ReactNode;
    content: string;
}

const InlineCoachCard: React.FC<InlineCoachCardProps> = ({
    variant,
    title,
    icon,
    content,
}) => {
    const [isExpanded, setIsExpanded] = useState(true);

    const isObservation = variant === 'observation';
    const cardClass = isObservation ? styles.coachInterventionCard : styles.suggestedResponseCard;
    const titleClass = isObservation ? styles.coachInterventionTitle : styles.suggestedResponseTitle;
    const bodyClass = isObservation ? styles.coachInterventionBody : styles.coachTipBody;

    return (
        <div className={`${cardClass} ${isExpanded ? styles.cardExpanded : styles.cardCollapsed}`}>
            <button
                type="button"
                className={styles.collapsibleHeaderBtn}
                onClick={() => setIsExpanded((prev) => !prev)}
                aria-expanded={isExpanded}
                title={isExpanded ? 'Click to collapse feedback' : 'Click to expand feedback'}
            >
                <div className={styles.collapsibleTitleRow}>
                    {icon}
                    <span className={titleClass}>{title}</span>
                </div>
                <svg
                    className={`${styles.chevronIcon} ${isExpanded ? styles.chevronOpen : ''}`}
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>
            {isExpanded && <p className={bodyClass}>{content}</p>}
        </div>
    );
};

interface EndingStageConfig {
    stageLabel: string;
    title: string;
    subtitle: string;
    progressPercent: number;
    tip: string;
    steps: {
        label: string;
        state: 'active' | 'completed' | 'waiting';
    }[];
    icon: React.ReactNode;
}

const ENDING_STAGES: EndingStageConfig[] = [
    {
        stageLabel: 'Stage 1 of 3: Transcript Analysis',
        title: 'Analyzing Your Conversation...',
        subtitle: 'Reviewing conversation turns, dialogue balance, and active listening across all exchanges.',
        progressPercent: 30,
        tip: 'Asking open-ended follow-up questions signals curiosity and keeps rapport flowing effortlessly.',
        steps: [
            { label: 'Reviewing conversation turns & active listening', state: 'active' },
            { label: 'Evaluating communication score & tone metrics', state: 'waiting' },
            { label: 'Synthesizing actionable coaching takeaways', state: 'waiting' },
        ],
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                <path d="M8 10h.01" />
                <path d="M12 10h.01" />
                <path d="M16 10h.01" />
            </svg>
        ),
    },
    {
        stageLabel: 'Stage 2 of 3: Score & Tone Assessment',
        title: 'Evaluating Communication Score & Tone...',
        subtitle: 'Measuring emotional tone, conversational reciprocity, and connection signals.',
        progressPercent: 68,
        tip: 'Balancing playful humor with specific personal details creates authentic rapport.',
        steps: [
            { label: 'Reviewing conversation turns & active listening', state: 'completed' },
            { label: 'Evaluating communication score & tone metrics', state: 'active' },
            { label: 'Synthesizing actionable coaching takeaways', state: 'waiting' },
        ],
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="m16 12-4-4-4 4" />
                <path d="M12 16V8" />
            </svg>
        ),
    },
    {
        stageLabel: 'Stage 3 of 3: Personalized Takeaways',
        title: 'Synthesizing Your Coaching Notes...',
        subtitle: 'Formulating tailored takeaways and high-impact recommendations for real-life conversations.',
        progressPercent: 92,
        tip: 'Suggesting a concrete venue or time signals authentic confidence and prevents stalling.',
        steps: [
            { label: 'Reviewing conversation turns & active listening', state: 'completed' },
            { label: 'Evaluating communication score & tone metrics', state: 'completed' },
            { label: 'Synthesizing actionable coaching takeaways', state: 'active' },
        ],
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            </svg>
        ),
    },
    {
        stageLabel: 'Finalizing Debrief',
        title: 'Finalizing Your Session Debrief...',
        subtitle: 'Assembling your score breakdown, replay review, and actionable takeaways.',
        progressPercent: 98,
        tip: 'Reviewing practice debriefs helps you internalize high-connection conversation habits.',
        steps: [
            { label: 'Reviewing conversation turns & active listening', state: 'completed' },
            { label: 'Evaluating communication score & tone metrics', state: 'completed' },
            { label: 'Synthesizing actionable coaching takeaways', state: 'completed' },
        ],
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
            </svg>
        ),
    },
];

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
    const [pendingUserMessage, setPendingUserMessage] = useState<string | null>(null);
    const [endingStageIndex, setEndingStageIndex] = useState(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesStreamRef = useRef<HTMLDivElement>(null);

    const isPaused = session.status === 'PAUSED';
    const isCompleted = session.status === 'COMPLETED';

    // Clear optimistic pending message once new transcript turns arrive from server
    useEffect(() => {
        setPendingUserMessage(null);
    }, [session.transcript.length]);

    // Progress through evaluation stages sequentially while ending rehearsal
    useEffect(() => {
        if (!isEnding) {
            setEndingStageIndex(0);
            return;
        }

        setEndingStageIndex(0);
        const interval = setInterval(() => {
            setEndingStageIndex((prev) => Math.min(prev + 1, ENDING_STAGES.length - 1));
        }, 2200);

        return () => clearInterval(interval);
    }, [isEnding]);

    const currentEndingStage = ENDING_STAGES[endingStageIndex];

    // Check if the pending user message has already been recorded in the authoritative transcript
    const isPendingAlreadyInTranscript =
        pendingUserMessage !== null &&
        session.transcript.some(
            (turn) => turn.role === 'USER' && turn.content.trim() === pendingUserMessage.trim()
        );
    const shouldShowPendingUserMessage = pendingUserMessage !== null && !isPendingAlreadyInTranscript;

    // Lock page-level scroll while chat simulation is active
    useEffect(() => {
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, []);

    // Resolve active partner name
    const resolvedPartnerName =
        partnerName ||
        (session.simulationType === 'MATCH_BASED' ? 'Sarah' : 'Alex (Generic Partner)');

    const partnerInitial = resolvedPartnerName.charAt(0).toUpperCase();

    // Auto-scroll on new transcript entries, typing change, or optimistic turn strictly within the messages stream
    useEffect(() => {
        if (messagesStreamRef.current) {
            messagesStreamRef.current.scrollTo({
                top: messagesStreamRef.current.scrollHeight,
                behavior: 'smooth',
            });
        }
    }, [session.transcript.length, isSendingTurn, shouldShowPendingUserMessage]);

    const handleSend = async () => {
        const text = inputValue.trim();
        if (!text || isSendingTurn || isPaused || isCompleted) return;
        setInputValue('');
        setPendingUserMessage(text);
        const success = await onSendMessage(text);
        if (success === false) {
            // Restore input text on failure so user does not lose message
            setPendingUserMessage(null);
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

    return (
        <div className={styles.simulationLayout}>
            {/* Left Sidebar (Partner Profile, Scenario Context & Session Controls) */}
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
                                {session.simulationType === 'MATCH_BASED' ? 'Matched Partner' : 'Practice Partner'}
                            </span>
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

                {/* 4. Session Actions */}
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
                        {isEnding ? (
                            <>
                                <svg
                                    className={styles.spinnerIcon}
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    aria-hidden="true"
                                >
                                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                </svg>
                                <span>Analyzing...</span>
                            </>
                        ) : (
                            <>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                                <span>End Session</span>
                            </>
                        )}
                    </button>
                </div>
            </aside>

            {/* Right Main Chat Pane */}
            <main className={styles.chatPane} aria-label="Conversation Rehearsal Thread">
                {/* AI Evaluation Debrief Loading Overlay (Dynamic multi-stage progression during End Session) */}
                {isEnding && (
                    <div className={styles.endingOverlay} role="status" aria-live="polite">
                        <div className={styles.endingCard}>
                            <div className={styles.endingIconWrapper}>
                                <div className={styles.pulseRing} />
                                <div className={styles.endingIconCore}>
                                    {currentEndingStage.icon}
                                </div>
                            </div>

                            <div className={styles.endingBadge}>
                                {currentEndingStage.stageLabel}
                            </div>

                            <h3 className={styles.endingTitle}>{currentEndingStage.title}</h3>
                            <p className={styles.endingSubtitle}>{currentEndingStage.subtitle}</p>

                            <div className={styles.endingStepsList}>
                                {currentEndingStage.steps.map((step) => {
                                    const isDone = step.state === 'completed';
                                    const isActive = step.state === 'active';

                                    return (
                                        <div
                                            key={step.label}
                                            className={`${styles.endingStepItem} ${
                                                isActive ? styles.stepItemActive : isDone ? styles.stepItemCompleted : ''
                                            }`}
                                        >
                                            <div className={styles.stepLeftRow}>
                                                {isDone ? (
                                                    <span className={styles.stepCheckIcon} aria-label="Completed">
                                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                                            <polyline points="20 6 9 17 4 12" />
                                                        </svg>
                                                    </span>
                                                ) : isActive ? (
                                                    <span className={styles.stepDotActive} aria-label="In progress" />
                                                ) : (
                                                    <span className={styles.stepDotWaiting} aria-label="Queued" />
                                                )}
                                                <span className={styles.stepLabelText}>{step.label}</span>
                                            </div>
                                            <span className={styles.stepStatusTag}>
                                                {isDone ? 'Done' : isActive ? 'Analyzing...' : 'Queued'}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className={styles.endingProgressMeta}>
                                <span className={styles.progressPercentText}>{currentEndingStage.progressPercent}% analyzed</span>
                                <span className={styles.progressEstimatedText}>AI evaluation running</span>
                            </div>

                            <div className={styles.endingProgressBar}>
                                <div
                                    className={styles.endingProgressFill}
                                    style={{ width: `${currentEndingStage.progressPercent}%` }}
                                />
                            </div>

                            <div className={styles.endingTipBox}>
                                <svg className={styles.endingTipIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="16" x2="12" y2="12" />
                                    <line x1="12" y1="8" x2="12.01" y2="8" />
                                </svg>
                                <div className={styles.endingTipText}>
                                    <span className={styles.endingTipHeading}>Coach Insight: </span>
                                    <span>{currentEndingStage.tip}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
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
                <div
                    ref={messagesStreamRef}
                    className={styles.messagesStream}
                    role="log"
                    aria-live="polite"
                >
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

                                {/* Inline Coach Feedback & Suggested Action (when present) */}
                                {coachNote && (
                                    <div className={styles.inlineCoachContainer}>
                                        {/* Dynamic Tone/Flow Pill (when tone exists) */}
                                        {coachNote.tone && (
                                            <div className={styles.inlinePraisePill}>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12"></polyline>
                                                </svg>
                                                <span>Tone: {coachNote.tone}</span>
                                            </div>
                                        )}

                                        {/* Coach Observation Card */}
                                        {coachNote.observation && (
                                            <InlineCoachCard
                                                variant="observation"
                                                title="Coach Observation"
                                                icon={
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                                        <circle cx="12" cy="12" r="10"></circle>
                                                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                                                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                                    </svg>
                                                }
                                                content={coachNote.observation}
                                            />
                                        )}

                                        {/* Coach Recommendation Card */}
                                        {coachNote.nextTip && (
                                            <InlineCoachCard
                                                variant="recommendation"
                                                title="Coach Recommendation"
                                                icon={
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                                        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
                                                    </svg>
                                                }
                                                content={coachNote.nextTip}
                                            />
                                        )}
                                    </div>
                                )}
                            </React.Fragment>
                        );
                    })}

                    {/* Optimistic User Turn (rendered immediately upon sending) */}
                    {shouldShowPendingUserMessage && (
                        <div className={styles.userRow}>
                            <div className={styles.userBubble}>
                                <p className={styles.bubbleText}>{pendingUserMessage}</p>
                            </div>
                        </div>
                    )}

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
