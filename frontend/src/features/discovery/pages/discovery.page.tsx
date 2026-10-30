import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useDiscoveryFeed } from '../hooks/use-discovery-feed.hook';
import { DEFAULT_DISCOVERY_QUERY } from '../constants/discovery.constants';
import type { GetRecommendationsQuery } from '../types/discovery.types';
import { DiscoveryCard } from '../components/discovery-card.component';
import { DiscoveryEmpty } from '../components/discovery-empty.component';
import { DiscoveryActions } from '../components/discovery-actions.component';
import { PriorityIntroModal } from '../components/priority-intro-modal.component';
import { DiscoveryFilterDrawer } from '../components/discovery-filter-drawer.component';
import styles from './discovery.module.css';

export const DiscoveryPage: React.FC = () => {
    const [queryParams, setQueryParams] = useState<GetRecommendationsQuery>({
        ...DEFAULT_DISCOVERY_QUERY,
    });

    const [isPriorityIntroOpen, setIsPriorityIntroOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const {
        activeProfile,
        hasMore,
        isLoading,
        isFetching,
        isError,
        refetch,
        actions,
    } = useDiscoveryFeed(queryParams);

    const handleConfirmPriorityIntro = (message: string) => {
        actions.handlePriorityIntro(message);
        setIsPriorityIntroOpen(false);
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
            <div className={styles.contentWrapper}>
                <header className={styles.header}>
                    <h1 className={styles.title}>Discover</h1>
                    <button
                        type="button"
                        aria-label="Filter recommendations"
                        className={`${styles.filterButton} ${isFilterActive ? styles.filterButtonActive : ''}`}
                        onClick={() => setIsFilterOpen(true)}
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

                <main className={styles.cardStage}>
                    {isLoading ? (
                        <div className={styles.skeletonCard} aria-busy="true">
                            <div className={styles.loadingSpinner} />
                            <p className={styles.loadingText}>Finding compatible souls...</p>
                        </div>
                    ) : isError ? (
                        <div className={styles.errorCard} role="alert">
                            <div className={styles.errorIconWrapper}>
                                <svg
                                    width="28"
                                    height="28"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                            </div>
                            <h2 className={styles.errorTitle}>Unable to load recommendations</h2>
                            <p className={styles.errorText}>
                                We encountered a problem retrieving matching profiles. Please check your connection and try again.
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
                        <AnimatePresence mode="wait">
                            {activeProfile && hasMore ? (
                                <motion.div
                                    key={activeProfile.id}
                                    initial={{ opacity: 0, y: 16, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -16, scale: 0.98 }}
                                    transition={{ duration: 0.22, ease: 'easeOut' }}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '1.25rem',
                                    }}
                                >
                                    <DiscoveryCard profile={activeProfile} />
                                    <DiscoveryActions
                                        onPass={actions.handlePass}
                                        onReviewLater={actions.handleReviewLater}
                                        onShortlist={actions.handleShortlist}
                                        onConnect={actions.handleConnect}
                                        onOpenPriorityIntro={() => setIsPriorityIntroOpen(true)}
                                        disabled={isFetching}
                                    />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="feed-empty"
                                    initial={{ opacity: 0, scale: 0.96 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.25, ease: 'easeOut' }}
                                    style={{ width: '100%' }}
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
                </main>
            </div>

            {/* Priority Introduction Modal with Credit Confirmation */}
            {activeProfile && (
                <PriorityIntroModal
                    isOpen={isPriorityIntroOpen}
                    recipientName={activeProfile.displayName}
                    recipientPhotoUrl={activeProfile.primaryPhotoUrl}
                    onClose={() => setIsPriorityIntroOpen(false)}
                    onConfirm={handleConfirmPriorityIntro}
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
