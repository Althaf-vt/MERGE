import React from 'react';
import { DISCOVERY_ACTION_LABELS, PRIORITY_INTRO_CONSTANTS } from '../constants/discovery.constants';
import styles from './discovery-actions.module.css';

export interface DiscoveryActionsProps {
    onPass: () => void;
    onReviewLater: () => void;
    onShortlist: () => void;
    onConnect: () => void;
    onOpenPriorityIntro: () => void;
    disabled?: boolean;
}

export const DiscoveryActions: React.FC<DiscoveryActionsProps> = ({
    onPass,
    onReviewLater,
    onShortlist,
    onConnect,
    onOpenPriorityIntro,
    disabled = false,
}) => {
    return (
        <div className={styles.actionsContainer} aria-label="Profile decision actions">
            <div className={styles.buttonRow}>
                {/* 1. Pass */}
                <div className={styles.actionItem}>
                    <button
                        type="button"
                        aria-label="Pass on this profile"
                        className={`${styles.circleButton} ${styles.passButton}`}
                        onClick={onPass}
                        disabled={disabled}
                    >
                        <svg
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                    <span className={styles.buttonLabel}>{DISCOVERY_ACTION_LABELS.PASS}</span>
                </div>

                {/* 2. Review Later */}
                <div className={styles.actionItem}>
                    <button
                        type="button"
                        aria-label="Save profile to review later"
                        className={`${styles.circleButton} ${styles.reviewLaterButton}`}
                        onClick={onReviewLater}
                        disabled={disabled}
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                        </svg>
                    </button>
                    <span className={styles.buttonLabel}>{DISCOVERY_ACTION_LABELS.REVIEW_LATER}</span>
                </div>

                {/* 3. Shortlist */}
                <div className={styles.actionItem}>
                    <button
                        type="button"
                        aria-label="Shortlist profile"
                        className={`${styles.circleButton} ${styles.shortlistButton}`}
                        onClick={onShortlist}
                        disabled={disabled}
                    >
                        <svg
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                    </button>
                    <span className={styles.buttonLabel}>{DISCOVERY_ACTION_LABELS.SHORTLIST}</span>
                </div>

                {/* 4. Connect / Express Interest */}
                <div className={styles.actionItem}>
                    <button
                        type="button"
                        aria-label="Send connection request"
                        className={`${styles.circleButton} ${styles.connectButton}`}
                        onClick={onConnect}
                        disabled={disabled}
                    >
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                    </button>
                    <span className={styles.buttonLabel}>{DISCOVERY_ACTION_LABELS.CONNECT}</span>
                </div>
            </div>

            {/* Direct Priority Intro Trigger */}
            <button
                type="button"
                className={styles.priorityIntroButton}
                onClick={onOpenPriorityIntro}
                disabled={disabled}
            >
                <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                <span>{DISCOVERY_ACTION_LABELS.PRIORITY_INTRO}</span>
                <span className={styles.creditTag}>
                    {PRIORITY_INTRO_CONSTANTS.CREDIT_COST} Credit
                </span>
            </button>
        </div>
    );
};

