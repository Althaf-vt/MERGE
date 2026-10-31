import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/api/base-api";
import type { ApiResponse } from "../../../shared/types/api-response.types";
import { API_ENDPOINTS } from "../../../shared/constants/api-endpoints.constant";
import type {
    ConnectionResponseDto,
    GetConnectionsQuery,
    GetPrivateListQuery,
    PrivateListResponseDto,
    SendConnectionRequestPayload,
    SendPriorityIntroPayload,
    AddToPrivateListPayload,
} from "../../../shared/types/connections.types";

export const connectionsApi = createApi({
    reducerPath: 'connectionsApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['ActiveConnections', 'PendingConnections', 'Shortlist', 'ReviewLater'],
    endpoints: (builder) => ({
        getConnections: builder.query<ApiResponse<ConnectionResponseDto[]>, GetConnectionsQuery>({
            query: (params) => ({
                url: API_ENDPOINTS.CONNECTIONS.BASE,
                method: 'GET',
                params: {
                    role: params.role,
                    status: Array.isArray(params.status) ? params.status.join(',') : params.status,
                    page: params.page,
                    limit: params.limit,
                },
            }),
            providesTags: (_result, _error, arg) => {
                const statusStr = Array.isArray(arg.status) ? arg.status.join(',') : String(arg.status);
                const tag = statusStr.includes('ACCEPTED') ? 'ActiveConnections' : 'PendingConnections';
                return [{ type: tag, id: 'LIST' }];
            },
        }),

        getPrivateList: builder.query<ApiResponse<PrivateListResponseDto[]>, GetPrivateListQuery>({
            query: (params) => ({
                url: API_ENDPOINTS.PRIVATE_LISTS.BASE,
                method: 'GET',
                params: {
                    listType: params.listType,
                    page: params.page,
                    limit: params.limit,
                },
            }),
            providesTags: (_result, _error, arg) => {
                const tag = arg.listType === 'SHORTLIST' ? 'Shortlist' : 'ReviewLater';
                return [{ type: tag, id: 'LIST' }];
            },
        }),

        sendConnectionRequest: builder.mutation<ApiResponse<void>, SendConnectionRequestPayload>({
            query: (body) => ({
                url: API_ENDPOINTS.CONNECTIONS.REQUEST,
                method: 'POST',
                body,
            }),
            invalidatesTags: [{ type: 'PendingConnections', id: 'LIST' }],
        }),

        sendPriorityIntro: builder.mutation<ApiResponse<void>, SendPriorityIntroPayload>({
            query: (body) => ({
                url: API_ENDPOINTS.CONNECTIONS.PRIORITY_INTRO,
                method: 'POST',
                body,
            }),
            invalidatesTags: [{ type: 'PendingConnections', id: 'LIST' }],
        }),

        acceptConnection: builder.mutation<ApiResponse<void>, string>({
            query: (connectionId) => ({
                url: API_ENDPOINTS.CONNECTIONS.ACCEPT(connectionId),
                method: 'POST',
            }),
            invalidatesTags: [
                { type: 'PendingConnections', id: 'LIST' },
                { type: 'ActiveConnections', id: 'LIST' },
            ],
        }),

        declineConnection: builder.mutation<ApiResponse<void>, string>({
            query: (connectionId) => ({
                url: API_ENDPOINTS.CONNECTIONS.DECLINE(connectionId),
                method: 'POST',
            }),
            invalidatesTags: [{ type: 'PendingConnections', id: 'LIST' }],
        }),

        cancelConnection: builder.mutation<ApiResponse<void>, string>({
            query: (connectionId) => ({
                url: API_ENDPOINTS.CONNECTIONS.CANCEL(connectionId),
                method: 'POST',
            }),
            invalidatesTags: [{ type: 'PendingConnections', id: 'LIST' }],
        }),

        revokeMatch: builder.mutation<ApiResponse<void>, string>({
            query: (connectionId) => ({
                url: API_ENDPOINTS.CONNECTIONS.REVOKE(connectionId),
                method: 'POST',
            }),
            invalidatesTags: [{ type: 'ActiveConnections', id: 'LIST' }],
        }),

        addToPrivateList: builder.mutation<ApiResponse<void>, AddToPrivateListPayload>({
            query: (body) => ({
                url: API_ENDPOINTS.PRIVATE_LISTS.ADD,
                method: 'POST',
                body,
            }),
            invalidatesTags: (_result, _error, arg) => [
                { type: arg.listType === 'SHORTLIST' ? 'Shortlist' : 'ReviewLater', id: 'LIST' },
            ],
        }),

        removeFromPrivateList: builder.mutation<ApiResponse<void>, string>({
            query: (targetUserId) => ({
                url: API_ENDPOINTS.PRIVATE_LISTS.REMOVE(targetUserId),
                method: 'DELETE',
            }),
            invalidatesTags: [
                { type: 'Shortlist', id: 'LIST' },
                { type: 'ReviewLater', id: 'LIST' },
            ],
        }),
    }),
});

export const {
    useGetConnectionsQuery,
    useGetPrivateListQuery,
    useSendConnectionRequestMutation,
    useSendPriorityIntroMutation,
    useAcceptConnectionMutation,
    useDeclineConnectionMutation,
    useCancelConnectionMutation,
    useRevokeMatchMutation,
    useAddToPrivateListMutation,
    useRemoveFromPrivateListMutation,
} = connectionsApi;
