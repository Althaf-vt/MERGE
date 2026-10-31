import { useCallback, useEffect, useMemo, useState } from "react";
import { useGetRecommendationsQuery } from "../api/discovery.api";
import type { GetRecommendationsQuery } from "../types/discovery.types";
import {
    useSendConnectionRequestMutation,
    useSendPriorityIntroMutation,
    useAddToPrivateListMutation,
} from "../../../shared/api/connections.api";

export const useDiscoveryFeed = (queryParams: GetRecommendationsQuery) => {
    const { data: response, isLoading, isFetching, isError, error, refetch } = useGetRecommendationsQuery(queryParams);

    // Shared connection mutations
    const [sendConnectionRequest, { isLoading: isSendingConnect }] = useSendConnectionRequestMutation();
    const [sendPriorityIntro, { isLoading: isSendingIntro }] = useSendPriorityIntroMutation();
    const [addToPrivateList, { isLoading: isUpdatingList }] = useAddToPrivateListMutation();

    const isActionLoading = isSendingConnect || isSendingIntro || isUpdatingList;

    // Core Mandate: Track an index pointer, never copy the array into local state
    const [currentIndex, setCurrentIndex] = useState<number>(0);

    // Reset index pointer whenever query parameters change
    useEffect(() => {
        setCurrentIndex(0);
    }, [queryParams.isGlobal, queryParams.page, queryParams.limit]);

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
    const hasPrevious = currentIndex > 0;

    const goToNext = useCallback(() => {
        if (currentIndex < recommendations.length) {
            setCurrentIndex((prev) => prev + 1);
        }
    }, [currentIndex, recommendations.length]);

    const goToPrevious = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
        }
    }, [currentIndex]);

    const _advanceFeed = useCallback(() => {
        setCurrentIndex((prev) => prev + 1);
    }, []);

    // --- Action Handlers Wired to Shared Connections API ---

    const handlePass = useCallback(() => {
        if (!activeProfile) return;
        _advanceFeed();
    }, [activeProfile, _advanceFeed]);

    const handleShortlist = useCallback(async () => {
        if (!activeProfile) return;
        try {
            await addToPrivateList({ targetUserId: activeProfile.id, listType: 'SHORTLIST' }).unwrap();
        } catch (err) {
            console.error('Failed to shortlist profile:', err);
        } finally {
            _advanceFeed();
        }
    }, [activeProfile, addToPrivateList, _advanceFeed]);

    const handleReviewLater = useCallback(async () => {
        if (!activeProfile) return;
        try {
            await addToPrivateList({ targetUserId: activeProfile.id, listType: 'REVIEW_LATER' }).unwrap();
        } catch (err) {
            console.error('Failed to save profile for review later:', err);
        } finally {
            _advanceFeed();
        }
    }, [activeProfile, addToPrivateList, _advanceFeed]);

    const handleConnect = useCallback(async () => {
        if (!activeProfile) return;
        try {
            await sendConnectionRequest({ targetUserId: activeProfile.id }).unwrap();
        } catch (err) {
            console.error('Failed to send connection request:', err);
        } finally {
            _advanceFeed();
        }
    }, [activeProfile, sendConnectionRequest, _advanceFeed]);

    const handlePriorityIntro = useCallback(async (message?: string) => {
        if (!activeProfile) return;
        try {
            await sendPriorityIntro({
                targetUserId: activeProfile.id,
                icebreakerMessage: message || '',
            }).unwrap();
        } catch (err) {
            console.error('Failed to send priority intro:', err);
        } finally {
            _advanceFeed();
        }
    }, [activeProfile, sendPriorityIntro, _advanceFeed]);

    return {
        // State
        activeProfile,
        currentIndex,
        hasMore,
        hasPrevious,
        totalAvailable,

        // Navigation
        goToNext,
        goToPrevious,

        // Load & Error indicators
        isLoading,
        isFetching,
        isError,
        isActionLoading,
        error,

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
