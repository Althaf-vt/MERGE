import { useCallback, useEffect, useMemo, useState } from "react";
import { useGetRecommendationsQuery } from "../api/discovery.api";
import type { GetRecommendationsQuery } from "../types/discovery.types";
import {
    useSendConnectionRequestMutation,
    useSendPriorityIntroMutation,
    useAddToPrivateListMutation,
} from "../../../shared/api/connections.api";

function extractErrorMessage(err: unknown, fallback: string): string {
    if (typeof err === 'object' && err !== null) {
        const errorObj = err as Record<string, unknown>;
        if (typeof errorObj.data === 'object' && errorObj.data !== null) {
            const dataObj = errorObj.data as Record<string, unknown>;
            if (typeof dataObj.error === 'object' && dataObj.error !== null) {
                const subError = dataObj.error as Record<string, unknown>;
                if (typeof subError.message === 'string') {
                    return subError.message;
                }
            }
            if (typeof dataObj.message === 'string') {
                return dataObj.message;
            }
        }
        if (typeof errorObj.message === 'string') {
            return errorObj.message;
        }
    }
    return fallback;
}

export const useDiscoveryFeed = (queryParams: GetRecommendationsQuery) => {
    const { data: response, isLoading, isFetching, isError, error, refetch } = useGetRecommendationsQuery(queryParams);

    // Shared connection mutations
    const [sendConnectionRequest, { isLoading: isSendingConnect }] = useSendConnectionRequestMutation();
    const [sendPriorityIntro, { isLoading: isSendingIntro }] = useSendPriorityIntroMutation();
    const [addToPrivateList, { isLoading: isUpdatingList }] = useAddToPrivateListMutation();

    const isActionLoading = isSendingConnect || isSendingIntro || isUpdatingList;

    // Action error state for user feedback
    const [actionError, setActionError] = useState<string | null>(null);

    // Core Mandate: Track an index pointer, never copy the array into local state
    const [currentIndex, setCurrentIndex] = useState<number>(0);

    // Auto-dismiss action error after 5 seconds
    useEffect(() => {
        if (!actionError) return;
        const timer = setTimeout(() => {
            setActionError(null);
        }, 5000);
        return () => clearTimeout(timer);
    }, [actionError]);

    // Reset index pointer and action error whenever query parameters change
    useEffect(() => {
        setCurrentIndex(0);
        setActionError(null);
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

    const clearActionError = useCallback(() => {
        setActionError(null);
    }, []);

    const goToNext = useCallback(() => {
        if (currentIndex < recommendations.length) {
            setActionError(null);
            setCurrentIndex((prev) => prev + 1);
        }
    }, [currentIndex, recommendations.length]);

    const goToPrevious = useCallback(() => {
        if (currentIndex > 0) {
            setActionError(null);
            setCurrentIndex((prev) => prev - 1);
        }
    }, [currentIndex]);

    const _advanceFeed = useCallback(() => {
        setCurrentIndex((prev) => prev + 1);
    }, []);

    // --- Action Handlers Wired to Shared Connections API ---

    const handlePass = useCallback(() => {
        if (!activeProfile) return;
        setActionError(null);
        _advanceFeed();
    }, [activeProfile, _advanceFeed]);

    const handleShortlist = useCallback(async () => {
        if (!activeProfile) return;
        setActionError(null);
        try {
            await addToPrivateList({ targetUserId: activeProfile.id, listType: 'SHORTLIST' }).unwrap();
            _advanceFeed();
        } catch (err: unknown) {
            const message = extractErrorMessage(err, 'Failed to add profile to shortlist.');
            console.error('Failed to shortlist profile:', err);
            setActionError(message);
            throw err;
        }
    }, [activeProfile, addToPrivateList, _advanceFeed]);

    const handleReviewLater = useCallback(async () => {
        if (!activeProfile) return;
        setActionError(null);
        try {
            await addToPrivateList({ targetUserId: activeProfile.id, listType: 'REVIEW_LATER' }).unwrap();
            _advanceFeed();
        } catch (err: unknown) {
            const message = extractErrorMessage(err, 'Failed to save profile for review later.');
            console.error('Failed to save profile for review later:', err);
            setActionError(message);
            throw err;
        }
    }, [activeProfile, addToPrivateList, _advanceFeed]);

    const handleConnect = useCallback(async () => {
        if (!activeProfile) return;
        setActionError(null);
        try {
            await sendConnectionRequest({ targetUserId: activeProfile.id }).unwrap();
            _advanceFeed();
        } catch (err: unknown) {
            const message = extractErrorMessage(err, 'Failed to send connection request.');
            console.error('Failed to send connection request:', err);
            setActionError(message);
            throw err;
        }
    }, [activeProfile, sendConnectionRequest, _advanceFeed]);

    const handlePriorityIntro = useCallback(async (message?: string) => {
        if (!activeProfile) return;
        setActionError(null);
        try {
            await sendPriorityIntro({
                targetUserId: activeProfile.id,
                icebreakerMessage: message || '',
            }).unwrap();
            _advanceFeed();
        } catch (err: unknown) {
            const messageText = extractErrorMessage(err, 'Failed to send priority introduction.');
            console.error('Failed to send priority intro:', err);
            setActionError(messageText);
            throw err;
        }
    }, [activeProfile, sendPriorityIntro, _advanceFeed]);

    return {
        // State
        activeProfile,
        currentIndex,
        hasMore,
        hasPrevious,
        totalAvailable,
        actionError,

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
        clearActionError,
        actions: {
            handlePass,
            handleShortlist,
            handleReviewLater,
            handleConnect,
            handlePriorityIntro,
        },
    };
};