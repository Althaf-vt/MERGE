import React from 'react';
import type { SceneSessionDto } from '../types/scene-partner.types';
import styles from './active-session-banner.module.css';

export interface ActiveSessionBannerProps {
    session: SceneSessionDto;
    onResume: () => void;
    onEnd: () => void;
    isEnding?: boolean;
}

export const ActiveSessionBanner: React.FC<ActiveSessionBannerProps> = ({
    session,
    onResume,
    onEnd,
    isEnding = false,
}) => {
    const isPaused = session.status === 'PAUSED';

    return (
        <aside className={styles.banner} aria-label="Ongoing simulation banner">
            <div className={styles.leftSection}>
                <div className={styles.iconWrapper} aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
                    </svg>
                </div>
                <div className={styles.textContent}>
                    <div className={styles.titleRow}>
                        <h4 className={styles.scenarioTitle}>{session.scenarioTitle}</h4>
                        <span
                            className={`${styles.statusBadge} ${isPaused ? styles.statusPaused : styles.statusActive}`}
                        >
                            {isPaused ? 'Paused' : 'In Progress'}
                        </span>
                    </div>
                    <p className={styles.subtitle}>
                        {session.turnCount} {session.turnCount === 1 ? 'turn' : 'turns'} taken. Pick up where you left off.
                    </p>
                </div>
            </div>

            <div className={styles.actions}>
                <button
                    type="button"
                    className={styles.endButton}
                    onClick={onEnd}
                    disabled={isEnding}
                >
                    {isEnding ? 'Ending...' : 'End Session'}
                </button>
                <button
                    type="button"
                    className={styles.resumeButton}
                    onClick={onResume}
                >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                    <span>Resume Practice</span>
                </button>
            </div>
        </aside>
    );
};
