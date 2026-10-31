import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import { useDiscoveryFeed } from '../hooks/use-discovery-feed.hook';
import { DEFAULT_DISCOVERY_QUERY } from '../constants/discovery.constants';
import type { GetRecommendationsQuery } from '../types/discovery.types';
import { DiscoveryCard } from '../components/discovery-card.component';
import { DiscoveryEmpty } from '../components/discovery-empty.component';
import { DiscoveryActions } from '../components/discovery-actions.component';
import { PriorityIntroModal } from '../components/priority-intro-modal.component';
import { DiscoveryFilterDrawer } from '../components/discovery-filter-drawer.component';
import styles from './discovery.module.css';

const cardVariants: Variants = {
    enter: (direction: number) => ({
        y: direction > 0 ? '50%' : '-50%',
        opacity: 0,
        scale: 0.94,
    }),
    center: {
        y: 0,
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.3,
            ease: 'easeOut',
        },
    },
    exit: (direction: number) => ({
        y: direction > 0 ? '-50%' : '50%',
        opacity: 0,
        scale: 0.94,
        transition: {
            duration: 0.24,
            ease: 'easeIn',
        },
    }),
};

export const DiscoveryPage: React.FC = () => {
    const [queryParams, setQueryParams] = useState<GetRecommendationsQuery>({
        ...DEFAULT_DISCOVERY_QUERY,
    });

    const [isPriorityIntroOpen, setIsPriorityIntroOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [scrollDirection, setScrollDirection] = useState<number>(1);
    const isScrollingRef = useRef(false);

    const {
        activeProfile,
        hasMore,
        hasPrevious,
        goToNext,
        goToPrevious,
        isLoading,
        isFetching,
        isError,
        isActionLoading,
        refetch,
        actions,
    } = useDiscoveryFeed(queryParams);

    // --- Reels Scrolling Logic (Wheel gesture with smooth snapping debounce) ---
    const handleWheel = useCallback((e: React.WheelEvent) => {
        // Suppress gesture when overlay modals are open
        if (isPriorityIntroOpen || isFilterOpen) return;

        // Ignore micro-scrolls
        if (Math.abs(e.deltaY) < 22) return;

        if (isScrollingRef.current) return;

        if (e.deltaY > 0) {
            // Scroll down -> advance to next card
            if (hasMore) {
                isScrollingRef.current = true;
                setScrollDirection(1);
                goToNext();
                setTimeout(() => {
                    isScrollingRef.current = false;
                }, 380);
            }
        } else if (e.deltaY < 0) {
            // Scroll up -> return to previous card
            if (hasPrevious) {
                isScrollingRef.current = true;
                setScrollDirection(-1);
                goToPrevious();
                setTimeout(() => {
                    isScrollingRef.current = false;
                }, 380);
            }
        }
    }, [isPriorityIntroOpen, isFilterOpen, hasMore, hasPrevious, goToNext, goToPrevious]);

    // --- Keyboard Arrows Navigation ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isPriorityIntroOpen || isFilterOpen) return;
            if (e.key === 'ArrowDown' || e.key === 'PageDown') {
                if (hasMore) {
                    setScrollDirection(1);
                    goToNext();
                }
            } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
                if (hasPrevious) {
                    setScrollDirection(-1);
                    goToPrevious();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPriorityIntroOpen, isFilterOpen, hasMore, hasPrevious, goToNext, goToPrevious]);

    // --- Action Handlers with Forward Slide Direction ---
    const handlePass = () => {
        setScrollDirection(1);
        actions.handlePass();
    };

    const handleConnect = () => {
        setScrollDirection(1);
        actions.handleConnect();
    };

    const handleReviewLater = () => {
        setScrollDirection(1);
        actions.handleReviewLater();
    };

    const handleShortlist = () => {
        setScrollDirection(1);
        actions.handleShortlist();
    };

    const handleConfirmPriorityIntro = (message: string) => {
        setScrollDirection(1);
        actions.handlePriorityIntro(message);
        setIsPriorityIntroOpen(false);
    };

    const handleNavigate = (direction: number) => {
        if (direction > 0 && hasMore) {
            setScrollDirection(1);
            goToNext();
        } else if (direction < 0 && hasPrevious) {
            setScrollDirection(-1);
            goToPrevious();
        }
    };

    const handleApplyFilters = (filters: { isGlobal?: boolean }) => {
        setQueryParams((prev) => ({
            ...prev,
            page: 1,
            isGlobal: filters.isGlobal,
        }));
    };

    const isFilterActive = Boolean(queryParams.isGlobal);

    return (
        <div className={styles.pageContainer}>
            <div className={styles.reelsWrapper} onWheel={handleWheel}>
                {/* Header Bar */}
                <header className={styles.headerBar}>
                    <h1 className={styles.title}>Discover</h1>
                    <button
                        type="button"
                        aria-label="Filter recommendations"
                        className={`${styles.filterButton} ${isFilterActive ? styles.filterButtonActive : ''}`}
                        onClick={() => setIsFilterOpen(true)}
                    >
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1="4" y1="21" x2="4" y2="14" />
                            <line x1="4" y1="10" x2="4" y2="3" />
                            <line x1="12" y1="21" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12" y2="3" />
                            <line x1="20" y1="21" x2="20" y2="16" />
                            <line x1="20" y1="12" x2="20" y2="3" />
                            <line x1="1" y1="14" x2="7" y2="14" />
                            <line x1="9" y1="8" x2="15" y2="8" />
                            <line x1="17" y1="16" x2="23" y2="16" />
                        </svg>
                        {isFilterActive && <span className={styles.activeDot} />}
                    </button>
                </header>

                {/* Reels Stage */}
                <main className={styles.stage}>
                    <div className={styles.cardFrame}>
                        {isLoading ? (
                            <div className={styles.skeletonCard} aria-busy="true">
                                <div className={styles.loadingSpinner} />
                                <p className={styles.loadingText}>Finding compatible souls...</p>
                            </div>
                        ) : isError ? (
                            <div className={styles.errorCard} role="alert">
                                <div className={styles.errorIconWrapper}>
                                    <svg
                                        width="26"
                                        height="26"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="12" y1="8" x2="12" y2="12" />
                                        <line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                </div>
                                <h2 className={styles.errorTitle}>Connection Error</h2>
                                <p className={styles.errorText}>
                                    Unable to load new profiles right now. Please try again.
                                </p>
                                <button
                                    type="button"
                                    className={styles.retryButton}
                                    onClick={() => refetch()}
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : (
                            <AnimatePresence mode="wait" custom={scrollDirection}>
                                {activeProfile && hasMore ? (
                                    <motion.div
                                        key={activeProfile.id}
                                        custom={scrollDirection}
                                        variants={cardVariants}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            position: 'absolute',
                                            inset: 0,
                                        }}
                                    >
                                        <DiscoveryCard profile={activeProfile}>
                                            <DiscoveryActions
                                                onPass={handlePass}
                                                onReviewLater={handleReviewLater}
                                                onShortlist={handleShortlist}
                                                onConnect={handleConnect}
                                                onOpenPriorityIntro={() => setIsPriorityIntroOpen(true)}
                                                disabled={isFetching || isActionLoading}
                                            />
                                        </DiscoveryCard>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="feed-empty"
                                        custom={scrollDirection}
                                        variants={cardVariants}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            position: 'absolute',
                                            inset: 0,
                                        }}
                                    >
                                        <DiscoveryEmpty
                                            onRefresh={() => refetch()}
                                            onOpenFilters={() => setIsFilterOpen(true)}
                                            onResetFilters={() => handleApplyFilters({ isGlobal: false })}
                                            isRefreshing={isFetching}
                                            isFilterActive={isFilterActive}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        )}
                    </div>

                    {/* Desktop Floating Up/Down Navigation Controls */}
                    <aside className={styles.sideControls} aria-label="Reels navigation">
                        <button
                            type="button"
                            className={styles.navArrowButton}
                            onClick={() => handleNavigate(-1)}
                            disabled={!hasPrevious || isLoading}
                            aria-label="Previous profile"
                        >
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polyline points="18 15 12 9 6 15" />
                            </svg>
                        </button>
                        <button
                            type="button"
                            className={styles.navArrowButton}
                            onClick={() => handleNavigate(1)}
                            disabled={!hasMore || isLoading}
                            aria-label="Next profile"
                        >
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </button>
                    </aside>
                </main>
            </div>

            {/* Priority Introduction Modal */}
            {activeProfile && (
                <PriorityIntroModal
                    isOpen={isPriorityIntroOpen}
                    recipientName={activeProfile.displayName}
                    recipientPhotoUrl={activeProfile.primaryPhotoUrl}
                    onClose={() => setIsPriorityIntroOpen(false)}
                    onConfirm={handleConfirmPriorityIntro}
                    isSubmitting={isActionLoading}
                />
            )}

            {/* Filter Slide-over Drawer */}
            <DiscoveryFilterDrawer
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                currentFilters={{ isGlobal: queryParams.isGlobal }}
                onApplyFilters={handleApplyFilters}
            />
        </div>
    );
};
