import { useState, useCallback } from 'react';
import { useGetConnectionsQuery, useRevokeMatchMutation } from '../api/connections.api';
import { CONNECTIONS_PAGINATION_DEFAULTS, CONNECTIONS_QUERY_CONFIG } from '../constants/connections.constants';

export const useActiveConnections = (initialLimit = CONNECTIONS_PAGINATION_DEFAULTS.DEFAULT_LIMIT) => {
    const [page, setPage] = useState<number>(CONNECTIONS_PAGINATION_DEFAULTS.DEFAULT_PAGE);
    const [limit, setLimit] = useState<number>(initialLimit);

    const { data: response, isLoading, isFetching, isError, error, refetch } = useGetConnectionsQuery({
        role: CONNECTIONS_QUERY_CONFIG.ACTIVE.role,
        status: CONNECTIONS_QUERY_CONFIG.ACTIVE.status,
        page,
        limit,
    });

    const [revokeMatch, { isLoading: isRevoking }] = useRevokeMatchMutation();

    const handleRevoke = useCallback(async (connectionId: string) => {
        return revokeMatch(connectionId).unwrap();
    }, [revokeMatch]);

    const total = response?.meta?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
        connections: response?.data ?? [],
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
        revokeMatch: handleRevoke,
        isRevoking,
    };
};

