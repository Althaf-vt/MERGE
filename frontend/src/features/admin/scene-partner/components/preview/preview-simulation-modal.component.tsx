import React, { useEffect, useRef, useState } from 'react';
import type { AdminPreviewSessionDto, ScenarioCategory } from '../../types/admin-scene-partner.types';
import { SCENARIO_CATEGORY_LABELS } from '../../constants/admin-scene-partner.constants';
import {
    useStartPreviewSessionMutation,
    useSendPreviewTurnMutation,
    useUpdatePreviewCoachingModeMutation,
} from '../../api/admin-scene-partner.api';
import { AdminModal } from '../../../../../shared/admin/components/admin-modal.component';
import { getErrorMessage } from '../../../../../shared/utils/error.util';
import styles from './preview-simulation-modal.module.css';

export interface PreviewSimulationModalProps {
    isOpen: boolean;
    scenarioId?: string;
    draftScenario?: {
        title?: string;
        category?: ScenarioCategory;
        promptContext?: string;
    } | null;
    onClose: () => void;
}

interface AdminInlineCoachCardProps {
    variant: 'observation' | 'recommendation';
    title: string;
    icon: React.ReactNode;
    content: string;
}

const AdminInlineCoachCard: React.FC<AdminInlineCoachCardProps> = ({
    variant,
    title,
    icon,
    content,
}) => {
    const [isExpanded, setIsExpanded] = useState(true);

    const isObservation = variant === 'observation';
    const cardClass = isObservation ? styles.coachObservationCard : styles.coachRecommendationCard;
    const titleClass = isObservation ? styles.coachObservationTitle : styles.coachRecommendationTitle;

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
                    width="12"
                    height="12"
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
            {isExpanded && <p className={styles.coachCardBody}>{content}</p>}
        </div>
    );
};

export const PreviewSimulationModal: React.FC<PreviewSimulationModalProps> = ({
    isOpen,
    scenarioId,
    draftScenario,
    onClose,
}) => {
    const [session, setSession] = useState<AdminPreviewSessionDto | null>(null);
    const [inputMessage, setInputMessage] = useState('');
    const [pendingUserMessage, setPendingUserMessage] = useState<string | null>(null);
    const [isCoachingEnabled, setIsCoachingEnabled] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const chatEndRef = useRef<HTMLDivElement>(null);

    const [startPreviewSession, { isLoading: isStarting }] = useStartPreviewSessionMutation();
    const [sendPreviewTurn, { isLoading: isSending }] = useSendPreviewTurnMutation();
    const [updatePreviewCoachingMode, { isLoading: isUpdatingCoaching }] = useUpdatePreviewCoachingModeMutation();

    const initSession = async (coaching: boolean) => {
        setErrorMsg(null);
        try {
            const response = await startPreviewSession({
                scenarioId,
                title: draftScenario?.title,
                category: draftScenario?.category,
                promptContext: draftScenario?.promptContext,
                isCoachingEnabled: coaching,
            }).unwrap();

            if (response.data) {
                setSession(response.data);
            }
        } catch (err: unknown) {
            setErrorMsg(getErrorMessage(err, 'Failed to initialize preview simulation sandbox.'));
        }
    };

    useEffect(() => {
        if (!isOpen) {
            setSession(null);
            setInputMessage('');
            setPendingUserMessage(null);
            setErrorMsg(null);
            return;
        }

        initSession(isCoachingEnabled);
    }, [isOpen, scenarioId]);

    useEffect(() => {
        setPendingUserMessage(null);
    }, [session?.transcript?.length]);

    const isPendingAlreadyInTranscript =
        pendingUserMessage !== null &&
        Boolean(
            session?.transcript?.some(
                (turn) => turn.role === 'USER' && turn.content.trim() === pendingUserMessage.trim()
            )
        );
    const shouldShowPendingUserMessage = pendingUserMessage !== null && !isPendingAlreadyInTranscript;

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [session?.transcript, isSending, shouldShowPendingUserMessage]);

    if (!isOpen) return null;

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = inputMessage.trim();
        if (!trimmed || !session || isSending) return;

        setErrorMsg(null);
        setInputMessage('');
        setPendingUserMessage(trimmed);

        try {
            const response = await sendPreviewTurn({
                sessionId: session.id,
                body: { content: trimmed, isCoachingEnabled },
            }).unwrap();

            if (response.data) {
                setSession(response.data);
                setPendingUserMessage(null);
            }
        } catch (err: unknown) {
            setErrorMsg(getErrorMessage(err, 'Failed to send preview turn.'));
            setPendingUserMessage(null);
            setInputMessage(trimmed);
        }
    };

    const handleToggleCoaching = async (checked: boolean) => {
        setIsCoachingEnabled(checked);
        if (session) {
            setSession((prev) => (prev ? { ...prev, isCoachingEnabled: checked } : null));
            try {
                await updatePreviewCoachingMode({
                    sessionId: session.id,
                    body: { isCoachingEnabled: checked },
                }).unwrap();
            } catch (err: unknown) {
                console.error('Failed to toggle coaching mode mid-session:', err);
            }
        }
    };

    const scenarioTitle = draftScenario?.title || session?.scenarioTitle || 'Scenario Preview Sandbox';
    const category = draftScenario?.category || session?.scenarioCategory || 'FIRST_MESSAGE';

    return (
        <AdminModal
            isOpen={isOpen}
            onClose={onClose}
            title="AI PREVIEW SIMULATION SANDBOX"
            subtitle="TEST-DRIVE CONVERSATIONAL PROMPTS & LIVE COACH EVALUATION"
            maxWidth="780px"
        >
            <div className={styles.sandboxContainer}>
                <div className={styles.topBar}>
                    <div className={styles.scenarioMeta}>
                        <span className={styles.scenarioTitle} title={scenarioTitle}>
                            {scenarioTitle}
                        </span>
                        <span className={styles.categoryBadge}>
                            {SCENARIO_CATEGORY_LABELS[category] || category}
                        </span>
                    </div>

                    <div className={styles.controlsRow}>
                        <label className={styles.coachingToggle}>
                            <input
                                type="checkbox"
                                className={styles.coachingCheckbox}
                                checked={isCoachingEnabled}
                                onChange={(e) => handleToggleCoaching(e.target.checked)}
                                disabled={isStarting || isSending || isUpdatingCoaching}
                            />
                            <span>Coaching Tips</span>
                        </label>

                        <button
                            type="button"
                            className={styles.restartBtn}
                            onClick={() => initSession(isCoachingEnabled)}
                            disabled={isStarting || isSending}
                        >
                            Restart
                        </button>
                    </div>
                </div>

                {errorMsg && <div className={styles.errorBanner}>{errorMsg}</div>}

                <div className={styles.chatArea}>
                    {isStarting ? (
                        <div className={styles.emptyState}>
                            <span>INITIALIZING GEMINI AI PREVIEW INSTANCE...</span>
                            <span style={{ fontSize: '11px' }}>Loading scenario prompt context and personality baseline...</span>
                        </div>
                    ) : (!session || !session.transcript || session.transcript.length === 0) && !shouldShowPendingUserMessage ? (
                        <div className={styles.emptyState}>
                            <span>PREVIEW SANDBOX READY</span>
                            <span style={{ fontSize: '11px' }}>Send a message below to start the conversational simulation.</span>
                        </div>
                    ) : (
                        <>
                            {session?.transcript?.map((turn, idx) => {
                                const isUser = turn.role === 'USER';
                                const coachNote = turn.coachNote;
                                return (
                                    <React.Fragment key={`preview-turn-${idx}`}>
                                        <div className={`${styles.turnRow} ${isUser ? styles.userTurn : styles.simTurn}`}>
                                            <div className={styles.speakerMeta}>
                                                <span>{isUser ? 'ADMIN TESTER' : 'AI PARTNER'}</span>
                                                <span>• {new Date(turn.timestamp).toLocaleTimeString()}</span>
                                            </div>

                                            <div className={`${styles.bubble} ${isUser ? styles.userBubble : styles.simBubble}`}>
                                                {turn.content}
                                            </div>
                                        </div>

                                        {coachNote && (
                                            <div className={styles.inlineCoachContainer}>
                                                <div className={styles.coachMetaRow}>
                                                    {coachNote.tone && (
                                                        <span className={styles.tonePill}>
                                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                                <polyline points="20 6 9 17 4 12" />
                                                            </svg>
                                                            <span>Tone: {coachNote.tone}</span>
                                                        </span>
                                                    )}
                                                    {coachNote.pacing && (
                                                        <span className={styles.pacingPill}>
                                                            <span>Pacing: {coachNote.pacing}</span>
                                                        </span>
                                                    )}
                                                </div>

                                                {coachNote.observation && (
                                                    <AdminInlineCoachCard
                                                        variant="observation"
                                                        title="Coach Observation"
                                                        icon={
                                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                                                <circle cx="12" cy="12" r="10" />
                                                                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                                                                <line x1="12" y1="17" x2="12.01" y2="17" />
                                                            </svg>
                                                        }
                                                        content={coachNote.observation}
                                                    />
                                                )}

                                                {coachNote.nextTip && (
                                                    <AdminInlineCoachCard
                                                        variant="recommendation"
                                                        title="Coach Recommendation"
                                                        icon={
                                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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

                            {shouldShowPendingUserMessage && (
                                <div className={`${styles.turnRow} ${styles.userTurn}`}>
                                    <div className={styles.speakerMeta}>
                                        <span>ADMIN TESTER</span>
                                        <span>• Sending...</span>
                                    </div>
                                    <div className={`${styles.bubble} ${styles.userBubble} ${styles.optimisticBubble}`}>
                                        {pendingUserMessage}
                                    </div>
                                </div>
                            )}

                            {isSending && (
                                <div className={`${styles.turnRow} ${styles.simTurn}`}>
                                    <div className={styles.speakerMeta}>
                                        <span>AI PARTNER</span>
                                        <span>• Thinking...</span>
                                    </div>
                                    <div className={styles.typingIndicator}>
                                        <span className={styles.typingDot} />
                                        <span className={styles.typingDot} />
                                        <span className={styles.typingDot} />
                                        <span className={styles.typingText}>Formulating response...</span>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    <div ref={chatEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className={styles.inputBar}>
                    <input
                        type="text"
                        className={styles.chatInput}
                        placeholder="Type a test rehearsal message as a user..."
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        disabled={isStarting || isSending || !session}
                        autoFocus
                    />
                    <button
                        type="submit"
                        className={styles.sendBtn}
                        disabled={!inputMessage.trim() || isStarting || isSending || !session}
                    >
                        {isSending ? 'Sending...' : 'Send'}
                    </button>
                </form>
            </div>
        </AdminModal>
    );
};
