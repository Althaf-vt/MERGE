import React, { useState, useEffect } from 'react';
import { PRIORITY_INTRO_LIMITS } from '../constants/connections.constants';
import styles from './priority-intro-modal.module.css';

export interface PriorityIntroModalProps {
    isOpen: boolean;
    recipientName: string;
    recipientPhotoUrl?: string | null;
    isSubmitting?: boolean;
    onClose: () => void;
    onConfirm: (message: string) => void;
}

export const PriorityIntroModal: React.FC<PriorityIntroModalProps> = ({
    isOpen,
    recipientName,
    recipientPhotoUrl,
    isSubmitting = false,
    onClose,
    onConfirm,
}) => {
    const [message, setMessage] = useState('');
    const [imageError, setImageError] = useState(false);

    // Reset state on open
    useEffect(() => {
        if (isOpen) {
            setMessage('');
            setImageError(false);
        }
    }, [isOpen]);

    // Handle Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen && !isSubmitting) {
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, isSubmitting, onClose]);

    if (!isOpen) return null;

    const fallbackInitial = recipientName.trim().charAt(0).toUpperCase() || '?';

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value;
        if (text.length <= PRIORITY_INTRO_LIMITS.MAX_LENGTH) {
            setMessage(text);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;
        onConfirm(message.trim());
    };

    return (
        <div
            className={styles.modalOverlay}
            onClick={() => !isSubmitting && onClose()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="priority-intro-title"
        >
            <div
                className={styles.modalContent}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className={styles.modalHeader}>
                    <div className={styles.headerLeft}>
                        {recipientPhotoUrl && !imageError ? (
                            <img
                                src={recipientPhotoUrl}
                                alt={recipientName}
                                className={styles.avatar}
                                onError={() => setImageError(true)}
                            />
                        ) : (
                            <div className={styles.avatarFallback}>
                                {fallbackInitial}
                            </div>
                        )}
                        <div className={styles.headerText}>
                            <h3 id="priority-intro-title" className={styles.title}>
                                Priority Intro to {recipientName}
                            </h3>
                            <p className={styles.subtitle}>
                                Stand out with a direct icebreaker message delivered right to their inbox.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        className={styles.closeButton}
                        onClick={onClose}
                        disabled={isSubmitting}
                        aria-label="Close dialog"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit}>
                    <div className={styles.modalBody}>
                        <div className={styles.textareaWrapper}>
                            <textarea
                                className={styles.textarea}
                                placeholder={`Write a personalized icebreaker message to ${recipientName}...`}
                                value={message}
                                onChange={handleTextChange}
                                maxLength={PRIORITY_INTRO_LIMITS.MAX_LENGTH}
                                disabled={isSubmitting}
                                rows={4}
                                autoFocus
                            />
                            <span className={styles.charCounter}>
                                {message.length} / {PRIORITY_INTRO_LIMITS.MAX_LENGTH}
                            </span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className={styles.modalFooter}>
                        <div className={styles.creditBadge}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                            </svg>
                            <span>Cost: {PRIORITY_INTRO_LIMITS.CREDIT_COST} Credit</span>
                        </div>

                        <div className={styles.footerActions}>
                            <button
                                type="button"
                                className={styles.cancelButton}
                                onClick={onClose}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className={styles.submitButton}
                                disabled={isSubmitting || !message.trim()}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className={styles.spinner} />
                                        <span>Sending...</span>
                                    </>
                                ) : (
                                    'Send Priority Intro'
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};