import { useState, useMemo } from 'react';
import { useGetHistoryQuery, useDeleteSessionMutation } from '../api/scene-partner.api';
import { SCENE_PARTNER_CONFIG } from '../constants/scene-partner.constants';
import { toast } from '../../../shared/utils/toast.util';
import { getErrorMessage } from '../../../shared/utils/error.util';

export const useSceneHistory = (initialLimit = SCENE_PARTNER_CONFIG.DEFAULT_HISTORY_LIMIT) => {
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(initialLimit);
    const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);

    const [deleteSessionMutation] = useDeleteSessionMutation();

    const skip = (page - 1) * limit;

    const { data: response, isLoading, isFetching, isError, error, refetch } = useGetHistoryQuery({
        limit,
        skip,
    });

    const sessions = useMemo(() => response?.data?.data ?? [], [response]);
    const total = response?.data?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    const handleDeleteSession = async (sessionId: string) => {
        try {
            setDeletingSessionId(sessionId);
            await deleteSessionMutation(sessionId).unwrap();
            toast.success('Practice session deleted successfully.');
        } catch (err) {
            const errorMsg = getErrorMessage(err, 'Failed to delete practice session.');
            toast.error(errorMsg);
        } finally {
            setDeletingSessionId(null);
        }
    };

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
        handleDeleteSession,
        deletingSessionId,
    };
};

