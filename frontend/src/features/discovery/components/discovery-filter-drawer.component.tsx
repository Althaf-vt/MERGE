import React, { useState, useEffect } from 'react';
import styles from './discovery-filter-drawer.module.css';

export interface DiscoveryFilterDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    currentFilters: {
        isGlobal?: boolean;
    };
    onApplyFilters: (filters: { isGlobal?: boolean }) => void;
}

export const DiscoveryFilterDrawer: React.FC<DiscoveryFilterDrawerProps> = ({
    isOpen,
    onClose,
    currentFilters,
    onApplyFilters,
}) => {
    const [draftIsGlobal, setDraftIsGlobal] = useState<boolean>(
        Boolean(currentFilters.isGlobal)
    );

    // Keep draft state in sync when drawer opens with fresh props
    useEffect(() => {
        if (isOpen) {
            setDraftIsGlobal(Boolean(currentFilters.isGlobal));
        }
    }, [isOpen, currentFilters.isGlobal]);

    // Handle Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleReset = () => {
        setDraftIsGlobal(false);
    };

    const handleApply = () => {
        onApplyFilters({
            isGlobal: draftIsGlobal,
        });
        onClose();
    };

    return (
        <div
            className={styles.drawerOverlay}
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="discovery-filter-title"
        >
            <div
                className={styles.drawerPanel}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className={styles.drawerHeader}>
                    <div className={styles.headerTitleWrapper}>
                        <h2 id="discovery-filter-title" className={styles.title}>
                            Filters
                        </h2>
                        <span className={styles.subtitle}>
                            Refine your discovery experience
                        </span>
                    </div>
                    <button
                        type="button"
                        className={styles.closeButton}
                        onClick={onClose}
                        aria-label="Close filters"
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Body Content */}
                <div className={styles.drawerBody}>
                    <div className={styles.filterSection}>
                        <div className={styles.sectionHeader}>
                            <h3 className={styles.sectionTitle}>Discovery Scope</h3>
                            <span
                                className={`${styles.scopeBadge} ${
                                    !draftIsGlobal ? styles.scopeBadgeInactive : ''
                                }`}
                            >
                                {draftIsGlobal ? 'Worldwide' : 'Local Radius'}
                            </span>
                        </div>

                        <div
                            className={`${styles.cardControl} ${
                                draftIsGlobal ? styles.cardControlActive : ''
                            }`}
                        >
                            <div className={styles.controlText}>
                                <label
                                    htmlFor="global-discovery-toggle"
                                    className={styles.controlLabel}
                                >
                                    Global Vector Matching
                                </label>
                                <p className={styles.controlDescription}>
                                    Expand beyond your geographical location to discover highly compatible
                                    profiles anywhere in the world.
                                </p>
                            </div>

                            <label className={styles.switchWrapper}>
                                <input
                                    id="global-discovery-toggle"
                                    type="checkbox"
                                    className={styles.switchInput}
                                    checked={draftIsGlobal}
                                    onChange={(e) => setDraftIsGlobal(e.target.checked)}
                                />
                                <span className={styles.switchSlider} />
                            </label>
                        </div>
                    </div>

                    <div className={styles.infoBox}>
                        <svg
                            className={styles.infoIcon}
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="16" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12.01" y2="8" />
                        </svg>
                        <span>
                            When Global Vector Matching is off, MERGE prioritizes nearby candidates.
                            Enabling it unlocks cross-border connections based purely on core values and personality.
                        </span>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className={styles.drawerFooter}>
                    <button
                        type="button"
                        className={styles.resetButton}
                        onClick={handleReset}
                    >
                        Reset
                    </button>
                    <button
                        type="button"
                        className={styles.applyButton}
                        onClick={handleApply}
                    >
                        Apply Filters
                    </button>
                </div>
            </div>
        </div>
    );
};

