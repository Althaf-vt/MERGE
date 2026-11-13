import React, { useState, useRef, useEffect } from 'react';
import type { SceneSessionDto } from '../types/scene-partner.types';
import { SCENARIO_CATEGORY_LABELS, SCENE_PARTNER_CONFIG } from '../constants/scene-partner.constants';
import { CoachNoteCard } from './coach-note-card.component';
import styles from './simulation-chat.module.css';

export interface SimulationChatProps {
    session: SceneSessionDto;
    onSendMessage: (content: string) => void;
    onPause: () => void;
    onResume: () => void;
    onEnd: () => void;
    isSendingTurn?: boolean;
    isPausing?: boolean;
    isResuming?: boolean;
    isEnding?: boolean;
    formattedTime?: string;
}

export const SimulationChat: React.FC<SimulationChatProps> = ({
    session,
    onSendMessage,
    onPause,
    onResume,
    onEnd,
    isSendingTurn = false,
    isPausing = false,
    isResuming = false,
    isEnding = false,
    formattedTime,
}) => {
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const isPaused = session.status === 'PAUSED';
    const isCompleted = session.status === 'COMPLETED';
    const categoryLabel = SCENARIO_CATEGORY_LABELS[session.scenarioCategory] || session.scenarioCategory;

    // Auto-scroll on new transcript entries or typing change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [session.transcript.length, isSendingTurn]);

    const handleSend = () => {
        if (!inputValue.trim() || isSendingTurn || isPaused || isCompleted) return;
        onSendMessage(inputValue.trim());
        setInputValue('');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatTimestamp = (isoString?: string) => {
        if (!isoString) return '';
        try {
            const date = new Date(isoString);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch {
            return '';
        }
    };

    return (
        <section className={styles.chatContainer} aria-label="Scene Simulation Chat">
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <h3 className={styles.title}>{session.scenarioTitle}</h3>
                    <span className={styles.badge}>{categoryLabel}</span>
                    <span className={styles.typeBadge}>
                        {session.simulationType === 'MATCH_BASED' ? 'Match Practice' : 'AI Partner'}
                    </span>
                </div>

                <div className={styles.headerActions}>
                    {formattedTime && (
                        <div className={styles.timerPill} title="Time Remaining">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                            </svg>
                            <span>{formattedTime}</span>
                        </div>
                    )}

                    {!isCompleted && (
                        isPaused ? (
                            <button
                                type="button"
                                className={styles.actionButton}
                                onClick={onResume}
                                disabled={isResuming}
                            >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                                <span>{isResuming ? 'Resuming...' : 'Resume'}</span>
                            </button>
                        ) : (
                            <button
                                type="button"
                                className={styles.actionButton}
                                onClick={onPause}
                                disabled={isPausing}
                            >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                                </svg>
                                <span>{isPausing ? 'Pausing...' : 'Pause'}</span>
                            </button>
                        )
                    )}

                    {!isCompleted && (
                        <button
                            type="button"
                            className={styles.endButton}
                            onClick={onEnd}
                            disabled={isEnding}
                        >
                            <span>{isEnding ? 'Ending...' : 'End Practice'}</span>
                        </button>
                    )}
                </div>
            </header>

            {/* Transcript Area */}
            <div className={styles.messagesList} role="log" aria-live="polite">
                <div className={styles.introBox}>
                    Practice session active. Respond naturally as you would on a real date. Your dating coach will observe and offer tips along the way.
                </div>

                {session.transcript.map((turn, index) => {
                    const isUser = turn.role === 'USER';

                    return isUser ? (
                        <div key={index} className={styles.messageRowUser}>
                            <div className={styles.bubbleUser}>
                                {turn.content}
                            </div>
                            <span className={styles.timestamp}>{formatTimestamp(turn.timestamp)}</span>
                        </div>
                    ) : (
                        <div key={index} className={styles.messageRowSim}>
                            <div className={styles.simContentWrapper}>
                                <div className={styles.avatar} aria-hidden="true">
                                    P
                                </div>
                                <div>
                                    <div className={styles.bubbleSim}>
                                        {turn.content}
                                    </div>
                                    <span className={styles.timestamp}>{formatTimestamp(turn.timestamp)}</span>
                                </div>
                            </div>

                            {turn.coachNote && (
                                <CoachNoteCard coachNote={turn.coachNote} />
                            )}
                        </div>
                    );
                })}

                {isSendingTurn && (
                    <div className={styles.typingIndicator} aria-label="Partner is typing">
                        <div className={styles.typingDot} />
                        <div className={styles.typingDot} />
                        <div className={styles.typingDot} />
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Footer / Input */}
            <footer className={styles.inputFooter}>
                {isPaused ? (
                    <div className={styles.pausedBanner}>
                        <span>Session is currently paused. Resume when you are ready to continue.</span>
                        <button
                            type="button"
                            className={styles.actionButton}
                            onClick={onResume}
                            disabled={isResuming}
                        >
                            {isResuming ? 'Resuming...' : 'Resume Practice'}
                        </button>
                    </div>
                ) : isCompleted ? (
                    <div className={styles.pausedBanner}>
                        <span>This simulation session has ended.</span>
                    </div>
                ) : (
                    <div>
                        <div className={styles.inputRow}>
                            <textarea
                                className={styles.textarea}
                                rows={2}
                                placeholder="Type your response to practice..."
                                value={inputValue}
                                maxLength={SCENE_PARTNER_CONFIG.MAX_MESSAGE_LENGTH}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isSendingTurn}
                            />
                            <button
                                type="button"
                                className={styles.sendButton}
                                onClick={handleSend}
                                disabled={!inputValue.trim() || isSendingTurn}
                                aria-label="Send response"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                                </svg>
                            </button>
                        </div>
                        <div className={styles.counterRow}>
                            <span className={styles.charCounter}>
                                {inputValue.length} / {SCENE_PARTNER_CONFIG.MAX_MESSAGE_LENGTH}
                            </span>
                        </div>
                    </div>
                )}
            </footer>
        </section>
    );
};

