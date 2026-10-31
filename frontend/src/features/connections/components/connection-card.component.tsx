import React, { useState } from 'react';
import type { ConnectionResponseDto } from '../types/connections.types';
import styles from './connection-card.module.css';

export interface ConnectionCardProps {
    connection: ConnectionResponseDto;
    onMessage: (partnerId: string, partnerName: string) => void;
    onRevoke: (connectionId: string, partnerName: string) => void;
    onViewProfile?: (partnerId: string) => void;
    disabled?: boolean;
}

export const ConnectionCard: React.FC<ConnectionCardProps> = ({
    connection,
    onMessage,
    onRevoke,
    onViewProfile,
    disabled = false,
}) => {
    const [imageError, setImageError] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const formatMatchedDate = (dateString: string): string => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Recently';

            const diffMs = Date.now() - date.getTime();
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffDays = Math.floor(diffHours / 24);

            if (diffHours < 1) return 'Just now';
            if (diffHours < 24) return `${diffHours}h ago`;
            if (diffDays === 1) return 'Yesterday';
            if (diffDays < 7) return `${diffDays}d ago`;

            return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        } catch {
            return 'Recently';
        }
    };

    const initial = connection.partnerName?.trim()?.charAt(0)?.toUpperCase() || '?';

    return (
        <article className={styles.card} aria-label={`Connection with ${connection.partnerName}`}>
            {/* Media Container */}
            <div className={styles.imageContainer}>
                {connection.partnerPhotoUrl && !imageError ? (
                    <img
                        src={connection.partnerPhotoUrl}
                        alt={connection.partnerName}
                        className={styles.avatarImage}
                        onError={() => setImageError(true)}
                        loading="lazy"
                    />
                ) : (
                    <div className={styles.fallbackAvatar}>
                        <span className={styles.avatarInitial}>{initial}</span>
                    </div>
                )}

                {/* Priority Match Badge */}
                {connection.isPriority && (
                    <div className={styles.priorityBadge}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        <span>Priority</span>
                    </div>
                )}

                {/* Overflow Kebab Menu */}
                <div className={styles.menuWrapper}>
                    <button
                        type="button"
                        aria-label="More connection options"
                        className={styles.menuTrigger}
                        onClick={() => setIsMenuOpen((prev) => !prev)}
                        disabled={disabled}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="12" cy="12" r="2" />
                            <circle cx="12" cy="5" r="2" />
                            <circle cx="12" cy="19" r="2" />
                        </svg>
                    </button>

                    {isMenuOpen && (
                        <>
                            <div className={styles.menuBackdrop} onClick={() => setIsMenuOpen(false)} />
                            <div className={styles.dropdownMenu} role="menu">
                                <button
                                    type="button"
                                    role="menuitem"
                                    className={`${styles.menuItem} ${styles.menuItemDanger}`}
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        onRevoke(connection.id, connection.partnerName);
                                    }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                    <span>Revoke Match</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Information Body */}
            <div className={styles.cardBody}>
                <div className={styles.metaRow}>
                    <h3 className={styles.partnerName} title={connection.partnerName}>
                        {connection.partnerName}
                    </h3>
                    <span className={styles.matchedTimestamp}>
                        Matched {formatMatchedDate(connection.createdAt)}
                    </span>
                </div>

                {/* Action Buttons */}
                <div className={styles.actionsRow}>
                    <button
                        type="button"
                        className={styles.messageButton}
                        onClick={() => onMessage(connection.partnerId, connection.partnerName)}
                        disabled={disabled}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        <span>Message</span>
                    </button>

                    {onViewProfile && (
                        <button
                            type="button"
                            className={styles.profileButton}
                            onClick={() => onViewProfile(connection.partnerId)}
                            disabled={disabled}
                        >
                            Profile
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
};
