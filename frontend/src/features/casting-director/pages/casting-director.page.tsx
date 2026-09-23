import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    useInitializeSessionMutation, 
    useProcessMessageMutation, 
    useFinalizeSessionMutation 
} from '../api/casting-director.api';
import styles from './casting-director.module.css';
import type { CastingSession } from '../types/casting.types';

export const CastingDirectorPage = () => {
    const navigate = useNavigate();
    const [initializeSession, { isLoading: isInitializing }] = useInitializeSessionMutation();
    const [processMessage, { isLoading: isProcessing }] = useProcessMessageMutation();
    const [finalizeSession, { isLoading: isFinalizing }] = useFinalizeSessionMutation();

    const [session, setSession] = useState<CastingSession | null>(null);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const effectRan = useRef(false);

    // Initialize session on mount
    useEffect(() => {
        // Prevent React 18 Strict Mode double-firing
        if (effectRan.current) return;
        effectRan.current = true;

        const init = async () => {
            try {
                const res = await initializeSession().unwrap();
                // Directly set the session. Do not use an isMounted check here.
                setSession(res.session);
            } catch (err) {
                console.error('Failed to initialize casting session', err);
            }
        };
        
        init();
        
        // Remove the return () => { isMounted = false; }; cleanup
    }, [initializeSession]);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [session?.transcript]);

    // Watch for ANALYZING status to trigger finalization
    useEffect(() => {
        if (session?.status === 'ANALYZING' && !isFinalizing) {
            const finalize = async () => {
                try {
                    await finalizeSession().unwrap();
                    // Once finalized, route the user to their dashboard/discovery feed
                    navigate('/dashboard', { replace: true });
                } catch (err) {
                    console.error('Failed to finalize session', err);
                }
            };
            // Add a slight delay so the user can read the final AI message
            const timer = setTimeout(finalize, 3000);
            return () => clearTimeout(timer);
        }
    }, [session?.status, isFinalizing, finalizeSession, navigate]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isProcessing || session?.status !== 'IN_PROGRESS') return;

        const messageContent = inputValue.trim();
        setInputValue('');

        // Optimistically update UI
        setSession(prev => prev ? {
            ...prev,
            transcript: [...prev.transcript, { role: 'user', content: messageContent, timestamp: new Date().toISOString() }]
        } : null);

        try {
            const res = await processMessage({ content: messageContent }).unwrap();
            setSession(res.session);
        } catch (err) {
            console.error('Failed to send message', err);
            // Revert optimistic update here if needed
        }
    };

    if (isInitializing && !session) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Connecting to the Casting Director...</p>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            <div className={styles.chatWindow}>
                <div className={styles.header}>
                    <h2>Casting Director</h2>
                    <p className={styles.subtitle}>Let's build your psychological profile</p>
                </div>

                <div className={styles.transcriptArea}>
                    {session?.transcript.map((msg, index) => (
                        <div 
                            key={index} 
                            className={`${styles.messageWrapper} ${msg.role === 'ai' ? styles.aiMessage : styles.userMessage}`}
                        >
                            <div className={styles.messageBubble}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    
                    {isProcessing && (
                        <div className={`${styles.messageWrapper} ${styles.aiMessage}`}>
                            <div className={styles.typingIndicator}>
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    )}
                    
                    {session?.status === 'ANALYZING' && (
                        <div className={styles.systemMessage}>
                            Generating your unique personality vector...
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form className={styles.inputArea} onSubmit={handleSendMessage}>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type your response..."
                        disabled={isProcessing || session?.status !== 'IN_PROGRESS'}
                        className={styles.textInput}
                        autoFocus
                    />
                    <button 
                        type="submit" 
                        disabled={!inputValue.trim() || isProcessing || session?.status !== 'IN_PROGRESS'}
                        className={styles.sendButton}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
};