import { useState, useMemo, useCallback } from 'react';
import {
    useGetConnectionsQuery,
    useAcceptConnectionMutation,
    useDeclineConnectionMutation,
    useCancelConnectionMutation,
} from '../../../shared/api/connections.api';
import type { ConnectionRole, PendingDirectionFilter } from '../../../shared/types/connections.types';
import { CONNECTIONS_PAGINATION_DEFAULTS } from '../constants/connections.constants';

export const usePendingConnections = (initialLimit = CONNECTIONS_PAGINATION_DEFAULTS.DEFAULT_LIMIT) => {
    const [filter, setFilterState] = useState<PendingDirectionFilter>('ALL');
    const [page, setPage] = useState<number>(CONNECTIONS_PAGINATION_DEFAULTS.DEFAULT_PAGE);
    const [limit, setLimit] = useState<number>(initialLimit);

    const role: ConnectionRole = useMemo(() => {
        if (filter === 'RECEIVED') return 'RECIPIENT';
        if (filter === 'SENT') return 'REQUESTER';
        return 'BOTH';
    }, [filter]);

    const { data: response, isLoading, isFetching, isError, error, refetch } = useGetConnectionsQuery({
        role,
        status: 'PENDING',
        page,
        limit,
    });

    const [acceptConnection, { isLoading: isAccepting }] = useAcceptConnectionMutation();
    const [declineConnection, { isLoading: isDeclining }] = useDeclineConnectionMutation();
    const [cancelConnection, { isLoading: isCancelling }] = useCancelConnectionMutation();

    const handleAccept = useCallback((connectionId: string) => acceptConnection(connectionId).unwrap(), [acceptConnection]);
    const handleDecline = useCallback((connectionId: string) => declineConnection(connectionId).unwrap(), [declineConnection]);
    const handleCancel = useCallback((connectionId: string) => cancelConnection(connectionId).unwrap(), [cancelConnection]);

    const setFilter = useCallback((newFilter: PendingDirectionFilter) => {
        setFilterState(newFilter);
        setPage(CONNECTIONS_PAGINATION_DEFAULTS.DEFAULT_PAGE);
    }, []);

    const total = response?.meta?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
        requests: response?.data ?? [],
        filter,
        setFilter,
        total,
        page,
        setPage,
        limit,
        setLimit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        isLoading,
        isFetching,
        isError,
        error,
        refetch,
        actions: {
            accept: handleAccept,
            decline: handleDecline,
            cancel: handleCancel,
        },
        actionLoading: {
            isAccepting,
            isDeclining,
            isCancelling,
        },
    };
};

