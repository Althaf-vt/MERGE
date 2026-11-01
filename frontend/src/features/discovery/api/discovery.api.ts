import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/api/base-api";
import type { ApiResponse } from "../../../shared/types/api-response.types";
import type { GetRecommendationsQuery, DiscoveryRecommendationDto, PassCandidatePayload } from "../types/discovery.types";
import { API_ENDPOINTS } from "../../../shared/constants/api-endpoints.constant";

export const discoveryApi = createApi({
    reducerPath: 'discoveryApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['DiscoveryFeed'],
    endpoints: (builder) => ({
        getRecommendations: builder.query<ApiResponse<DiscoveryRecommendationDto[]>, GetRecommendationsQuery>({
            query: (params) => ({
                url: API_ENDPOINTS.DISCOVERY.RECOMMENDATIONS,
                method: 'GET',
                params,
            }),
            serializeQueryArgs: ({ endpointName, queryArgs }) => {
                return `${endpointName}-${Boolean(queryArgs.isGlobal)}`;
            },
            merge: (currentCache, newItems, { arg }) => {
                if (!currentCache || arg.page === 1 || !currentCache.data) {
                    return newItems;
                }
                const newCandidates = newItems.data || [];
                const existingIds = new Set(currentCache.data.map((item) => item.id));
                const uniqueNewItems = newCandidates.filter((item) => !existingIds.has(item.id));
                currentCache.data.push(...uniqueNewItems);
                currentCache.meta = newItems.meta;
            },
            forceRefetch({ currentArg, previousArg }) {
                return currentArg?.page !== previousArg?.page || currentArg?.isGlobal !== previousArg?.isGlobal;
            },
            providesTags: ['DiscoveryFeed'],
        }),
        passCandidate: builder.mutation<ApiResponse<void>, PassCandidatePayload>({
            query: (body) => ({
                url: API_ENDPOINTS.DISCOVERY.PASS,
                method: 'POST',
                body,
            }),
        }),
    }),
});

export const {
    useGetRecommendationsQuery,
    usePassCandidateMutation,
} = discoveryApi;