import { useCallback, useEffect, useMemo, useState } from "react";
import { useGetRecommendationsQuery, usePassCandidateMutation } from "../api/discovery.api";
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
    const [page, setPage] = useState<number>(1);
    const [hasMorePages, setHasMorePages] = useState<boolean>(true);

    const effectiveQueryParams = useMemo(() => ({
        ...queryParams,
        page,
    }), [queryParams, page]);

    const {
        data: response,
        isLoading,
        isFetching,
        isError,
        error,
        refetch,
    } = useGetRecommendationsQuery(effectiveQueryParams);

    // Shared mutations
    const [passCandidate, { isLoading: isPassingCandidate }] = usePassCandidateMutation();
    const [sendConnectionRequest, { isLoading: isSendingConnect }] = useSendConnectionRequestMutation();
    const [sendPriorityIntro, { isLoading: isSendingIntro }] = useSendPriorityIntroMutation();
    const [addToPrivateList, { isLoading: isUpdatingList }] = useAddToPrivateListMutation();

    const isActionLoading = isPassingCandidate || isSendingConnect || isSendingIntro || isUpdatingList;

    // Action error state for user feedback
    const [actionError, setActionError] = useState<string | null>(null);

    // Core Mandate: Track an index pointer, never copy the array into local state
    const [currentIndex, setCurrentIndex] = useState<number>(0);

    // Reset pagination, index pointer, and error whenever filter parameters change
    useEffect(() => {
        setPage(1);
        setCurrentIndex(0);
        setHasMorePages(true);
        setActionError(null);
    }, [queryParams.isGlobal]);

    // Auto-dismiss action error after 5 seconds
    useEffect(() => {
        if (!actionError) return;
        const timer = setTimeout(() => {
            setActionError(null);
        }, 5000);
        return () => clearTimeout(timer);
    }, [actionError]);

    const recommendations = response?.data || [];
    const totalAvailable = response?.meta?.total || 0;
    const limit = queryParams.limit ?? 20;

    // Monitor batch completeness to determine if more pages exist
    useEffect(() => {
        if (response?.data) {
            const isLastPage = (response.meta?.total ?? response.data.length) < limit;
            if (isLastPage) {
                setHasMorePages(false);
            }
        }
    }, [response, limit]);

    // Prefetch next page when user is within 3 items from the end of the loaded batch
    useEffect(() => {
        const remainingInBatch = recommendations.length - currentIndex;
        if (
            remainingInBatch <= 3 &&
            hasMorePages &&
            !isFetching &&
            !isLoading &&
            recommendations.length > 0
        ) {
            setPage((prev) => prev + 1);
        }
    }, [currentIndex, recommendations.length, hasMorePages, isFetching, isLoading]);

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

    const handleRefresh = useCallback(() => {
        setPage(1);
        setCurrentIndex(0);
        setHasMorePages(true);
        refetch();
    }, [refetch]);

    // --- Action Handlers Wired to Shared Connections API & Discovery Pass ---

    const handlePass = useCallback(async () => {
        if (!activeProfile) return;
        setActionError(null);
        try {
            await passCandidate({ targetUserId: activeProfile.id }).unwrap();
            _advanceFeed();
        } catch (err: unknown) {
            const message = extractErrorMessage(err, 'Failed to pass profile.');
            console.error('Failed to pass profile:', err);
            setActionError(message);
            throw err;
        }
    }, [activeProfile, passCandidate, _advanceFeed]);

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
        handleRefresh,
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