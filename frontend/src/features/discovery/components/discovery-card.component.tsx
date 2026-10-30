import React, { useState } from 'react';
import type { DiscoveryRecommendationDto } from '../types/discovery.types';
import styles from './discovery-card.module.css';

export interface DiscoveryCardProps {
    profile: DiscoveryRecommendationDto;
    children?: React.ReactNode;
}

export const DiscoveryCard: React.FC<DiscoveryCardProps> = ({ profile, children }) => {
    const [imageError, setImageError] = useState(false);

    const displayName = profile.displayName?.trim() || 'Anonymous';
    const fallbackInitial = displayName.charAt(0).toUpperCase() || 'U';

    const locationText = [profile.city, profile.state || profile.country]
        .filter(Boolean)
        .join(', ') || 'Location hidden';

    return (
        <article className={styles.cardContainer} aria-label={`Profile card for ${displayName}`}>
            {profile.primaryPhotoUrl && !imageError ? (
                <img
                    src={profile.primaryPhotoUrl}
                    alt={displayName}
                    className={styles.photo}
                    onError={() => setImageError(true)}
                    loading="eager"
                />
            ) : (
                <div className={styles.photoFallback}>
                    <span className={styles.fallbackInitial}>{fallbackInitial}</span>
                    <span className={styles.fallbackText}>No photo provided</span>
                </div>
            )}

            {/* Floating Top Badge */}
            <div className={styles.floatingTopStrip}>
                <div className={styles.matchScoreBadge}>
                    <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                    <span>{profile.matchScore}% Match</span>
                </div>
            </div>

            {/* Bottom Details Scrim */}
            <div className={styles.bottomScrim}>
                <div className={styles.identityRow}>
                    <h2 className={styles.displayName}>{displayName}</h2>
                    {profile.customLabel && (
                        <span className={styles.customLabel}>{profile.customLabel}</span>
                    )}
                </div>

                <div className={styles.metaRow}>
                    <span className={styles.metaItem}>
                        <svg
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span>{locationText}</span>
                    </span>

                    {profile.age !== null && (
                        <>
                            <span className={styles.metaDot}>•</span>
                            <span className={styles.metaItem}>{profile.age} Years</span>
                        </>
                    )}

                    <span className={styles.metaDot}>•</span>
                    <span className={styles.metaItem}>{profile.distanceKm} km away</span>
                </div>

                {profile.bio && (
                    <p className={styles.bioText}>{profile.bio}</p>
                )}

                {/* Nested Action Controls */}
                {children && <div className={styles.actionsSlot}>{children}</div>}
            </div>
        </article>
    );
};
