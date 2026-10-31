import { useState, useCallback } from 'react';
import {
    useGetPrivateListQuery,
    useRemoveFromPrivateListMutation,
    useAddToPrivateListMutation,
    useSendConnectionRequestMutation,
    useSendPriorityIntroMutation,
} from '../api/connections.api';
import type { PrivateListType } from '../../../shared/types/connections.types';
import { CONNECTIONS_PAGINATION_DEFAULTS } from '../constants/connections.constants';

export const usePrivateList = (
    listType: PrivateListType,
    initialLimit = CONNECTIONS_PAGINATION_DEFAULTS.DEFAULT_LIMIT
) => {
    const [page, setPage] = useState<number>(CONNECTIONS_PAGINATION_DEFAULTS.DEFAULT_PAGE);
    const [limit, setLimit] = useState<number>(initialLimit);

    const { data: response, isLoading, isFetching, isError, error, refetch } = useGetPrivateListQuery({
        listType,
        page,
        limit,
    });

    const [removeFromList, { isLoading: isRemoving }] = useRemoveFromPrivateListMutation();
    const [addToList, { isLoading: isAdding }] = useAddToPrivateListMutation();
    const [sendRequest, { isLoading: isSendingRequest }] = useSendConnectionRequestMutation();
    const [sendIntro, { isLoading: isSendingIntro }] = useSendPriorityIntroMutation();

    const handleRemove = useCallback((targetUserId: string) => removeFromList(targetUserId).unwrap(), [removeFromList]);

    const handleMove = useCallback(async (targetUserId: string, targetType: PrivateListType) => {
        await addToList({ targetUserId, listType: targetType }).unwrap();
        await removeFromList(targetUserId).unwrap();
    }, [addToList, removeFromList]);

    const handleSendRequest = useCallback((targetUserId: string) => sendRequest({ targetUserId }).unwrap(), [sendRequest]);

    const handleSendIntro = useCallback((targetUserId: string, icebreakerMessage: string) => {
        return sendIntro({ targetUserId, icebreakerMessage }).unwrap();
    }, [sendIntro]);

    const total = response?.meta?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
        items: response?.data ?? [],
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
            remove: handleRemove,
            move: handleMove,
            sendRequest: handleSendRequest,
            sendPriorityIntro: handleSendIntro,
        },
        actionLoading: {
            isRemoving,
            isAdding,
            isSendingRequest,
            isSendingIntro,
        },
    };
};

