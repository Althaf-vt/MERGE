import { useCallback, useMemo, useState } from "react";
import { useGetRecommendationsQuery } from "../api/discovery.api";
import type { GetRecommendationsQuery } from "../types/discovery.types";

export const useDiscoveryFeed = (queryParams: GetRecommendationsQuery) => {
    const { data: response, isLoading, isFetching, refetch } = useGetRecommendationsQuery(queryParams);

    // Core Mandate: Track an index pointer, never copy the array into local state
    const [currentIndex, setCurrentIndex] = useState<number>(0);

    const recommendations = response?.data || [];
    const totalAvailable = response?.meta?.total || 0;

    // Dynamically derive the active profile from the backend data array
    const activeProfile = useMemo(() => {
        if (recommendations.length === 0 || currentIndex >= recommendations.length) {
            return null;
        }
        return recommendations[currentIndex];
    }, [recommendations, currentIndex]);

    const hasMore = currentIndex < recommendations.length;

    const _advanceFeed = useCallback(() => {
        setCurrentIndex((prev) => prev + 1);
    }, []);

    // --- Action Stubs (To be wired to Connection mutations later) ---

    const handlePass = useCallback(() => {
        if (!activeProfile) return;
        console.log(`[STUB] Pass action dispatched for user: ${activeProfile.id}`);
        _advanceFeed();
    }, [activeProfile, _advanceFeed]);

    const handleShortlist = useCallback(() => {
        if (!activeProfile) return;
        console.log(`[STUB] Shortlist action dispatched for user: ${activeProfile.id}`);
        _advanceFeed();
    }, [activeProfile, _advanceFeed]);

    const handleReviewLater = useCallback(() => {
        if (!activeProfile) return;
        console.log(`[STUB] Review Later action dispatched for user: ${activeProfile.id}`);
        _advanceFeed();
    }, [activeProfile, _advanceFeed]);

    const handleConnect = useCallback(() => {
        if (!activeProfile) return;
        console.log(`[STUB] Connect / Express Interest action dispatched for user: ${activeProfile.id}`);
        _advanceFeed();
    }, [activeProfile, _advanceFeed]);

    const handlePriorityIntro = useCallback((message?: string) => {
        if (!activeProfile) return;
        // NOTE: The UI consuming this hook renders a confirmation modal first 
        // to warn the user about credit consumption before calling this.
        console.log(`[STUB] Priority Intro action dispatched for user: ${activeProfile.id}`, { message });
        _advanceFeed();
    }, [activeProfile, _advanceFeed]);

    return {
        // State
        activeProfile,
        hasMore,
        totalAvailable,

        // Load indicators
        isLoading,
        isFetching,

        // Actions
        refetch,
        actions: {
            handlePass,
            handleShortlist,
            handleReviewLater,
            handleConnect,
            handlePriorityIntro,
        },
    };
};