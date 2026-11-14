import { useState, useMemo } from 'react';
import { useGetHistoryQuery } from '../api/scene-partner.api';
import { SCENE_PARTNER_CONFIG } from '../constants/scene-partner.constants';

export const useSceneHistory = (initialLimit = SCENE_PARTNER_CONFIG.DEFAULT_HISTORY_LIMIT) => {
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(initialLimit);

    const skip = (page - 1) * limit;

    const { data: response, isLoading, isFetching, isError, error, refetch } = useGetHistoryQuery({
        limit,
        skip,
    });

    const sessions = useMemo(() => response?.data?.data ?? [], [response]);
    const total = response?.data?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
        sessions,
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
    };
};

