import React, { useState } from 'react';
import type { ConnectionResponseDto } from '../../../shared/types/connections.types';
import styles from './pending-card.module.css';

export interface PendingCardProps {
    request: ConnectionResponseDto;
    onAccept: (connectionId: string) => void;
    onDecline: (connectionId: string) => void;
    onCancel: (connectionId: string) => void;
    onViewProfile?: (partnerId: string) => void;
    isAccepting?: boolean;
    isDeclining?: boolean;
    isCancelling?: boolean;
    disabled?: boolean;
}

export const PendingCard: React.FC<PendingCardProps> = ({
    request,
    onAccept,
    onDecline,
    onCancel,
    onViewProfile,
    isAccepting = false,
    isDeclining = false,
    isCancelling = false,
    disabled = false,
}) => {
    const [imageError, setImageError] = useState(false);

    const isIncoming = !request.isRequester;
    const initial = request.partnerName?.trim()?.charAt(0)?.toUpperCase() || '?';

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

    return (
        <article className={styles.card} aria-label={`Pending request from ${request.partnerName}`}>
            {/* Media Container */}
            <div className={styles.imageContainer}>
                {request.partnerPhotoUrl && !imageError ? (
                    <img
                        src={request.partnerPhotoUrl}
                        alt={request.partnerName}
                        className={styles.avatarImage}
                        onError={() => setImageError(true)}
                        loading="lazy"
                    />
                ) : (
                    <div className={styles.fallbackAvatar}>
                        <span className={styles.avatarInitial}>{initial}</span>
                    </div>
                )}

                {/* Direction Badge */}
                <div className={styles.topBadges}>
                    <span className={`${styles.directionBadge} ${isIncoming ? styles.badgeIncoming : styles.badgeOutgoing}`}>
                        {isIncoming ? 'Received' : 'Sent'}
                    </span>
                </div>
            </div>

            {/* Information & Action Body */}
            <div className={styles.cardBody}>
                <div className={styles.metaRow}>
                    <h3 className={styles.partnerName} title={request.partnerName}>
                        {request.partnerName}
                    </h3>
                    <span className={styles.timestamp}>
                        {isIncoming ? 'Received' : 'Sent'} {formatTimestamp(request.createdAt)}
                    </span>
                </div>

                {/* Action Buttons based on Direction */}
                <div className={styles.actionsContainer}>
                    {isIncoming ? (
                        <>
                            {/* Primary Accept */}
                            <button
                                type="button"
                                className={styles.acceptButton}
                                onClick={() => onAccept(request.id)}
                                disabled={disabled || isAccepting || isDeclining}
                            >
                                {isAccepting ? (
                                    <>
                                        <span className={styles.spinner} />
                                        <span>Accepting...</span>
                                    </>
                                ) : (
                                    <span>Accept</span>
                                )}
                            </button>

                            {/* Secondary Row (Profile + Decline) */}
                            <div className={styles.secondaryRow}>
                                {onViewProfile && (
                                    <button
                                        type="button"
                                        className={styles.profileButton}
                                        onClick={() => onViewProfile(request.partnerId)}
                                        disabled={disabled}
                                    >
                                        Profile
                                    </button>
                                )}
                                <button
                                    type="button"
                                    className={styles.declineButton}
                                    onClick={() => onDecline(request.id)}
                                    disabled={disabled || isAccepting || isDeclining}
                                >
                                    {isDeclining ? 'Declining...' : 'Decline'}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className={styles.sentActionsRow}>
                            {onViewProfile && (
                                <button
                                    type="button"
                                    className={styles.profileButton}
                                    onClick={() => onViewProfile(request.partnerId)}
                                    disabled={disabled}
                                >
                                    View Profile
                                </button>
                            )}
                            <button
                                type="button"
                                className={styles.cancelButton}
                                onClick={() => onCancel(request.id)}
                                disabled={disabled || isCancelling}
                            >
                                {isCancelling ? 'Cancelling...' : 'Cancel Request'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
};
