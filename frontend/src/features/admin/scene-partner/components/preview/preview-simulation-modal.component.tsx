import React, { useEffect, useRef, useState } from 'react';
import type { AdminPreviewSessionDto, ScenarioCategory } from '../../types/admin-scene-partner.types';
import { SCENARIO_CATEGORY_LABELS } from '../../constants/admin-scene-partner.constants';
import { useStartPreviewSessionMutation, useSendPreviewTurnMutation } from '../../api/admin-scene-partner.api';
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

export const PreviewSimulationModal: React.FC<PreviewSimulationModalProps> = ({
    isOpen,
    scenarioId,
    draftScenario,
    onClose,
}) => {
    const [session, setSession] = useState<AdminPreviewSessionDto | null>(null);
    const [inputMessage, setInputMessage] = useState('');
    const [isCoachingEnabled, setIsCoachingEnabled] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const chatEndRef = useRef<HTMLDivElement>(null);

    const [startPreviewSession, { isLoading: isStarting }] = useStartPreviewSessionMutation();
    const [sendPreviewTurn, { isLoading: isSending }] = useSendPreviewTurnMutation();

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
            setErrorMsg(null);
            return;
        }

        initSession(isCoachingEnabled);
    }, [isOpen, scenarioId]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [session?.transcript, isSending]);

    if (!isOpen) return null;

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = inputMessage.trim();
        if (!trimmed || !session || isSending) return;

        setErrorMsg(null);
        setInputMessage('');

        try {
            const response = await sendPreviewTurn({
                sessionId: session.id,
                body: { content: trimmed },
            }).unwrap();

            if (response.data) {
                setSession(response.data);
            }
        } catch (err: unknown) {
            setErrorMsg(getErrorMessage(err, 'Failed to send preview turn.'));
        }
    };

    const handleToggleCoaching = (checked: boolean) => {
        setIsCoachingEnabled(checked);
        initSession(checked);
    };

    const scenarioTitle = draftScenario?.title || session?.scenarioTitle || 'Scenario Preview Sandbox';
    const category = draftScenario?.category || session?.scenarioCategory || 'FIRST_MESSAGE';

    return (
        <AdminModal
            isOpen={isOpen}
            onClose={onClose}
            title="AI PREVIEW SIMULATION SANDBOX"
            subtitle="TEST-DRIVE CONVERSATIONAL PROMPTS & LIVE COACH EVALUATION"
            size="lg"
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
                                disabled={isStarting || isSending}
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
                    ) : !session || !session.transcript || session.transcript.length === 0 ? (
                        <div className={styles.emptyState}>
                            <span>PREVIEW SANDBOX READY</span>
                            <span style={{ fontSize: '11px' }}>Send a message below to start the conversational simulation.</span>
                        </div>
                    ) : (
                        session.transcript.map((turn, idx) => {
                            const isUser = turn.role === 'USER';
                            return (
                                <div
                                    key={`preview-turn-${idx}`}
                                    className={`${styles.turnRow} ${isUser ? styles.userTurn : styles.simTurn}`}
                                >
                                    <div className={styles.speakerMeta}>
                                        <span>{isUser ? 'ADMIN TESTER' : 'AI PARTNER'}</span>
                                        <span>• {new Date(turn.timestamp).toLocaleTimeString()}</span>
                                    </div>

                                    <div className={`${styles.bubble} ${isUser ? styles.userBubble : styles.simBubble}`}>
                                        {turn.content}
                                    </div>

                                    {isUser && turn.coachNote && (
                                        <div className={styles.coachNoteCard}>
                                            <div className={styles.coachHeader}>Coach Evaluation</div>
                                            {turn.coachNote.observation && (
                                                <div className={styles.coachText}>
                                                    <strong>Observation:</strong> {turn.coachNote.observation}
                                                </div>
                                            )}
                                            {turn.coachNote.nextTip && (
                                                <div className={styles.coachText}>
                                                    <strong>Next Tip:</strong> {turn.coachNote.nextTip}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}

                    {isSending && (
                        <div className={styles.typingIndicator}>
                            <span>AI partner is thinking and formulating response...</span>
                        </div>
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
