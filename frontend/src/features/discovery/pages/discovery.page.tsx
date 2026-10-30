import React, { useState } from 'react';
import { useDiscoveryFeed } from '../hooks/use-discovery-feed.hook';
import { DEFAULT_DISCOVERY_QUERY } from '../constants/discovery.constants';
import type { GetRecommendationsQuery } from '../types/discovery.types';
import { DiscoveryCard } from '../components/discovery-card.component';
import { DiscoveryEmpty } from '../components/discovery-empty.component';
import styles from './discovery.module.css';

export const DiscoveryPage: React.FC = () => {
    const [queryParams] = useState<GetRecommendationsQuery>({
        ...DEFAULT_DISCOVERY_QUERY,
    });

    const {
        activeProfile,
        hasMore,
        isLoading,
        isFetching,
        refetch,
    } = useDiscoveryFeed(queryParams);

    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentWrapper}>
                <header className={styles.header}>
                    <h1 className={styles.title}>Discover</h1>
                    <button
                        type="button"
                        aria-label="Filter recommendations"
                        className={styles.filterButton}
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
                    </button>
                </header>

                <main className={styles.cardStage}>
                    {isLoading ? (
                        <div className={styles.skeletonCard} aria-busy="true">
                            <div className={styles.loadingSpinner} />
                            <p className={styles.loadingText}>Finding compatible souls...</p>
                        </div>
                    ) : activeProfile && hasMore ? (
                        <DiscoveryCard profile={activeProfile} />
                    ) : (
                        <DiscoveryEmpty
                            onRefresh={() => refetch()}
                            onOpenFilters={() => {}}
                            isRefreshing={isFetching}
                        />
                    )}
                </main>
            </div>
        </div>
    );
};
