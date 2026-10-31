import React, { useState } from 'react';
import type { PrivateListResponseDto, PrivateListType } from '../../../shared/types/connections.types';
import styles from './private-list-card.module.css';

export interface PrivateListCardProps {
    item: PrivateListResponseDto;
    onConnect: (targetUserId: string) => void;
    onPriorityIntro: (targetUserId: string, targetName: string) => void;
    onMove: (targetUserId: string, targetType: PrivateListType) => void;
    onRemove: (targetUserId: string) => void;
    onViewProfile?: (targetUserId: string) => void;
    isConnecting?: boolean;
    isMoving?: boolean;
    isRemoving?: boolean;
    disabled?: boolean;
}

export const PrivateListCard: React.FC<PrivateListCardProps> = ({
    item,
    onConnect,
    onPriorityIntro,
    onMove,
    onRemove,
    onViewProfile,
    isConnecting = false,
    isMoving = false,
    isRemoving = false,
    disabled = false,
}) => {
    const [imageError, setImageError] = useState(false);

    const isShortlist = item.listType === 'SHORTLIST';
    const initial = item.targetName?.trim()?.charAt(0)?.toUpperCase() || '?';

    const formatTimestamp = (dateString: string): string => {
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

    const handleToggleList = () => {
        const nextType: PrivateListType = isShortlist ? 'REVIEW_LATER' : 'SHORTLIST';
        onMove(item.targetUserId, nextType);
    };

    return (
        <article className={styles.card} aria-label={`${isShortlist ? 'Shortlisted' : 'Saved'} profile: ${item.targetName}`}>
            {/* Media Container */}
            <div className={styles.imageContainer}>
                {item.targetPhotoUrl && !imageError ? (
                    <img
                        src={item.targetPhotoUrl}
                        alt={item.targetName}
                        className={styles.avatarImage}
                        onError={() => setImageError(true)}
                        loading="lazy"
                    />
                ) : (
                    <div className={styles.fallbackAvatar}>
                        <span className={styles.avatarInitial}>{initial}</span>
                    </div>
                )}

                {/* Status Tag Pill */}
                <span className={styles.statusBadge}>
                    {isShortlist ? 'Shortlisted' : 'Review Later'}
                </span>
            </div>

            {/* Information & Action Body */}
            <div className={styles.cardBody}>
                <div className={styles.metaRow}>
                    <h3 className={styles.partnerName} title={item.targetName}>
                        {item.targetName}
                    </h3>
                    <span className={styles.timestamp}>
                        {isShortlist ? 'Shortlisted' : 'Saved'} {formatTimestamp(item.createdAt)}
                    </span>
                </div>

                {/* Primary Action Buttons */}
                <div className={styles.primaryActionRow}>
                    <button
                        type="button"
                        className={styles.connectButton}
                        onClick={() => onConnect(item.targetUserId)}
                        disabled={disabled || isConnecting || isMoving || isRemoving}
                        aria-label={`Send connection request to ${item.targetName}`}
                    >
                        {isConnecting ? (
                            <>
                                <span className={styles.spinner} />
                                <span>Connecting...</span>
                            </>
                        ) : (
                            <>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="22" y1="2" x2="11" y2="13" />
                                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                </svg>
                                <span>Connect</span>
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        className={styles.priorityIntroButton}
                        onClick={() => onPriorityIntro(item.targetUserId, item.targetName)}
                        disabled={disabled || isConnecting || isMoving || isRemoving}
                        title="Send Priority Intro (1 Credit)"
                        aria-label={`Send Priority Introduction to ${item.targetName}`}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                    </button>
                </div>

                {/* Secondary Actions & Move Switch */}
                <div className={styles.secondaryRow}>
                    {onViewProfile && (
                        <button
                            type="button"
                            className={styles.profileButton}
                            onClick={() => onViewProfile(item.targetUserId)}
                            disabled={disabled || isConnecting || isMoving || isRemoving}
                        >
                            Profile
                        </button>
                    )}

                    <button
                        type="button"
                        className={styles.moveButton}
                        onClick={handleToggleList}
                        disabled={disabled || isMoving || isConnecting || isRemoving}
                        title={isShortlist ? 'Move to Review Later' : 'Move to Shortlist'}
                    >
                        {isMoving ? (
                            <span className={styles.spinnerSmall} />
                        ) : isShortlist ? (
                            <>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                </svg>
                                <span>Review Later</span>
                            </>
                        ) : (
                            <>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                                </svg>
                                <span>Shortlist</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Bottom Destructive Remove Action */}
                <div className={styles.removeRow}>
                    <button
                        type="button"
                        className={styles.removeButton}
                        onClick={() => onRemove(item.targetUserId)}
                        disabled={disabled || isRemoving || isConnecting || isMoving}
                        aria-label={`Remove ${item.targetName} from list`}
                    >
                        {isRemoving ? 'Removing...' : 'Remove'}
                    </button>
                </div>
            </div>
        </article>
    );
};
