import { useCallback, useMemo, useState } from "react";
import {
    useGetConnectionsQuery,
    useGetPrivateListQuery,
    useAcceptConnectionMutation,
    useDeclineConnectionMutation,
    useCancelConnectionMutation,
    useRevokeMatchMutation,
    useSendConnectionRequestMutation,
    useSendPriorityIntroMutation,
    useAddToPrivateListMutation,
    useRemoveFromPrivateListMutation,
} from "../api/connections.api";
import type {
    ConnectionRole,
    ConnectionsTab,
    PendingDirectionFilter,
    ConnectionResponseDto,
    PrivateListResponseDto,
} from "../types/connections.types";
import {
    CONNECTIONS_PAGINATION_DEFAULTS,
    CONNECTIONS_QUERY_CONFIG,
} from "../constants/connections.constants";

export interface UseConnectionsTabsOptions {
    initialTab?: ConnectionsTab;
    initialLimit?: number;
}

export const useConnectionsTabs = (options: UseConnectionsTabsOptions = {}) => {
    const {
        initialTab = 'ACTIVE',
        initialLimit = CONNECTIONS_PAGINATION_DEFAULTS.DEFAULT_LIMIT,
    } = options;

    // --- State ---
    const [activeTab, setActiveTabState] = useState<ConnectionsTab>(initialTab);
    const [pendingFilter, setPendingFilter] = useState<PendingDirectionFilter>('ALL');
    const [page, setPageState] = useState<number>(CONNECTIONS_PAGINATION_DEFAULTS.DEFAULT_PAGE);
    const [limit, setLimitState] = useState<number>(initialLimit);

    // Tab switching resets pagination
    const setActiveTab = useCallback((tab: ConnectionsTab) => {
        setActiveTabState(tab);
        setPageState(CONNECTIONS_PAGINATION_DEFAULTS.DEFAULT_PAGE);
    }, []);

    // Set page with lower bound check
    const setPage = useCallback((newPage: number) => {
        setPageState(Math.max(1, newPage));
    }, []);

    // --- Active Tab Queries ---
    const isActiveTab = activeTab === 'ACTIVE';
    const isPendingTab = activeTab === 'PENDING';
    const isShortlistedTab = activeTab === 'SHORTLISTED';
    const isReviewLaterTab = activeTab === 'REVIEW_LATER';

    // 1. Active Connections Query (Accepted Matches)
    const activeQuery = useGetConnectionsQuery(
        {
            role: CONNECTIONS_QUERY_CONFIG.ACTIVE.role,
            status: CONNECTIONS_QUERY_CONFIG.ACTIVE.status,
            page,
            limit,
        },
        { skip: !isActiveTab }
    );

    // 2. Pending Connections Query (Pending Inbound/Outbound)
    const pendingRole: ConnectionRole = useMemo(() => {
        switch (pendingFilter) {
            case 'RECEIVED':
                return 'RECIPIENT';
            case 'SENT':
                return 'REQUESTER';
            case 'ALL':
            default:
                return 'BOTH';
        }
    }, [pendingFilter]);

    const pendingQuery = useGetConnectionsQuery(
        {
            role: pendingRole,
            status: 'PENDING',
            page,
            limit,
        },
        { skip: !isPendingTab }
    );

    // 3. Shortlisted Profiles Query
    const shortlistQuery = useGetPrivateListQuery(
        {
            listType: 'SHORTLIST',
            page,
            limit,
        },
        { skip: !isShortlistedTab }
    );

    // 4. Review Later Profiles Query
    const reviewLaterQuery = useGetPrivateListQuery(
        {
            listType: 'REVIEW_LATER',
            page,
            limit,
        },
        { skip: !isReviewLaterTab }
    );

    // --- Data Normalization across Tabs ---
    const activeData: ConnectionResponseDto[] = useMemo(() => {
        if (isActiveTab) return activeQuery.data?.data || [];
        if (isPendingTab) return pendingQuery.data?.data || [];
        return [];
    }, [isActiveTab, isPendingTab, activeQuery.data, pendingQuery.data]);

    const privateListData: PrivateListResponseDto[] = useMemo(() => {
        if (isShortlistedTab) return shortlistQuery.data?.data || [];
        if (isReviewLaterTab) return reviewLaterQuery.data?.data || [];
        return [];
    }, [isShortlistedTab, isReviewLaterTab, shortlistQuery.data, reviewLaterQuery.data]);

    const total = useMemo(() => {
        if (isActiveTab) return activeQuery.data?.meta?.total || 0;
        if (isPendingTab) return pendingQuery.data?.meta?.total || 0;
        if (isShortlistedTab) return shortlistQuery.data?.meta?.total || 0;
        if (isReviewLaterTab) return reviewLaterQuery.data?.meta?.total || 0;
        return 0;
    }, [
        isActiveTab,
        isPendingTab,
        isShortlistedTab,
        isReviewLaterTab,
        activeQuery.data?.meta?.total,
        pendingQuery.data?.meta?.total,
        shortlistQuery.data?.meta?.total,
        reviewLaterQuery.data?.meta?.total,
    ]);

    const isLoading = isActiveTab
        ? activeQuery.isLoading
        : isPendingTab
        ? pendingQuery.isLoading
        : isShortlistedTab
        ? shortlistQuery.isLoading
        : reviewLaterQuery.isLoading;

    const isFetching = isActiveTab
        ? activeQuery.isFetching
        : isPendingTab
        ? pendingQuery.isFetching
        : isShortlistedTab
        ? shortlistQuery.isFetching
        : reviewLaterQuery.isFetching;

    const isError = isActiveTab
        ? activeQuery.isError
        : isPendingTab
        ? pendingQuery.isError
        : isShortlistedTab
        ? shortlistQuery.isError
        : reviewLaterQuery.isError;

    const error = isActiveTab
        ? activeQuery.error
        : isPendingTab
        ? pendingQuery.error
        : isShortlistedTab
        ? shortlistQuery.error
        : reviewLaterQuery.error;

    const refetchCurrentTab = useCallback(() => {
        if (isActiveTab) return activeQuery.refetch();
        if (isPendingTab) return pendingQuery.refetch();
        if (isShortlistedTab) return shortlistQuery.refetch();
        if (isReviewLaterTab) return reviewLaterQuery.refetch();
    }, [isActiveTab, isPendingTab, isShortlistedTab, isReviewLaterTab, activeQuery, pendingQuery, shortlistQuery, reviewLaterQuery]);

    // Pagination calculations
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    const goToNextPage = useCallback(() => {
        if (hasNextPage) setPageState((prev) => prev + 1);
    }, [hasNextPage]);

    const goToPreviousPage = useCallback(() => {
        if (hasPreviousPage) setPageState((prev) => Math.max(1, prev - 1));
    }, [hasPreviousPage]);

    // --- Action Mutations ---
    const [acceptMutation, { isLoading: isAccepting }] = useAcceptConnectionMutation();
    const [declineMutation, { isLoading: isDeclining }] = useDeclineConnectionMutation();
    const [cancelMutation, { isLoading: isCancelling }] = useCancelConnectionMutation();
    const [revokeMutation, { isLoading: isRevoking }] = useRevokeMatchMutation();
    const [sendRequestMutation, { isLoading: isSendingRequest }] = useSendConnectionRequestMutation();
    const [sendIntroMutation, { isLoading: isSendingPriorityIntro }] = useSendPriorityIntroMutation();
    const [addToListMutation, { isLoading: isAddingToList }] = useAddToPrivateListMutation();
    const [removeFromListMutation, { isLoading: isRemovingFromList }] = useRemoveFromPrivateListMutation();

    // Handlers
    const handleAcceptConnection = useCallback(async (connectionId: string): Promise<boolean> => {
        try {
            await acceptMutation(connectionId).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [acceptMutation]);

    const handleDeclineConnection = useCallback(async (connectionId: string): Promise<boolean> => {
        try {
            await declineMutation(connectionId).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [declineMutation]);

    const handleCancelConnection = useCallback(async (connectionId: string): Promise<boolean> => {
        try {
            await cancelMutation(connectionId).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [cancelMutation]);

    const handleRevokeMatch = useCallback(async (connectionId: string): Promise<boolean> => {
        try {
            await revokeMutation(connectionId).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [revokeMutation]);

    const handleSendConnectionRequest = useCallback(async (targetUserId: string): Promise<boolean> => {
        try {
            await sendRequestMutation({ targetUserId }).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [sendRequestMutation]);

    const handleSendPriorityIntro = useCallback(async (targetUserId: string, icebreakerMessage: string): Promise<boolean> => {
        try {
            await sendIntroMutation({ targetUserId, icebreakerMessage }).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [sendIntroMutation]);

    const handleRemoveFromPrivateList = useCallback(async (targetUserId: string): Promise<boolean> => {
        try {
            await removeFromListMutation(targetUserId).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [removeFromListMutation]);

    const handleMoveToShortlist = useCallback(async (targetUserId: string): Promise<boolean> => {
        try {
            await addToListMutation({ targetUserId, listType: 'SHORTLIST' }).unwrap();
            await removeFromListMutation(targetUserId).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [addToListMutation, removeFromListMutation]);

    const handleMoveToReviewLater = useCallback(async (targetUserId: string): Promise<boolean> => {
        try {
            await addToListMutation({ targetUserId, listType: 'REVIEW_LATER' }).unwrap();
            await removeFromListMutation(targetUserId).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [addToListMutation, removeFromListMutation]);

    return {
        // Tab & Filter State
        activeTab,
        setActiveTab,
        pendingFilter,
        setPendingFilter,

        // Pagination State & Navigators
        page,
        setPage,
        limit,
        setLimit: setLimitState,
        total,
        totalPages,
        hasNextPage,
        hasPreviousPage,
        goToNextPage,
        goToPreviousPage,

        // Normalized Data (Depending on active tab)
        connections: activeData,
        privateList: privateListData,

        // Status Indicators
        isLoading,
        isFetching,
        isError,
        error,
        refetch: refetchCurrentTab,

        // Action Handlers
        actions: {
            acceptConnection: handleAcceptConnection,
            declineConnection: handleDeclineConnection,
            cancelConnection: handleCancelConnection,
            revokeMatch: handleRevokeMatch,
            sendConnectionRequest: handleSendConnectionRequest,
            sendPriorityIntro: handleSendPriorityIntro,
            removeFromPrivateList: handleRemoveFromPrivateList,
            moveToShortlist: handleMoveToShortlist,
            moveToReviewLater: handleMoveToReviewLater,
        },

        // Action Loading Indicators
        actionLoading: {
            isAccepting,
            isDeclining,
            isCancelling,
            isRevoking,
            isSendingRequest,
            isSendingPriorityIntro,
            isAddingToList,
            isRemovingFromList,
        },
    };
};
