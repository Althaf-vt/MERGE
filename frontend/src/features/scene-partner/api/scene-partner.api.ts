import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/api/base-api";
import type { ApiResponse } from "../../../shared/types/api-response.types";
import { API_ENDPOINTS } from "../../../shared/constants/api-endpoints.constant";
import type {
    GetScenariosQuery,
    GetSceneHistoryQuery,
    PaginatedSceneSessionsDto,
    ScenarioDto,
    SceneSessionDto,
    SendSceneTurnPayload,
    SessionActionPayload,
    StartSceneSessionPayload,
} from "../types/scene-partner.types";

export const scenePartnerApi = createApi({
    reducerPath: 'scenePartnerApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['ScenePartnerActive', 'ScenePartnerHistory', 'ScenePartnerScenarios'],
    endpoints: (builder) => ({
        getScenarios: builder.query<ApiResponse<ScenarioDto[]>, GetScenariosQuery | void>({
            query: (params) => ({
                url: API_ENDPOINTS.SCENE_PARTNER.SCENARIOS,
                method: 'GET',
                params: params || undefined,
            }),
            providesTags: ['ScenePartnerScenarios'],
        }),

        getActiveSession: builder.query<ApiResponse<SceneSessionDto | null>, void>({
            query: () => ({
                url: API_ENDPOINTS.SCENE_PARTNER.ACTIVE_SESSION,
                method: 'GET',
            }),
            providesTags: ['ScenePartnerActive'],
        }),

        getSessionById: builder.query<ApiResponse<SceneSessionDto>, string>({
            query: (id) => ({
                url: API_ENDPOINTS.SCENE_PARTNER.SESSION_BY_ID(id),
                method: 'GET',
            }),
            providesTags: (_result, _error, id) => [{ type: 'ScenePartnerActive', id }],
        }),

        getHistory: builder.query<ApiResponse<PaginatedSceneSessionsDto>, GetSceneHistoryQuery | void>({
            query: (params) => ({
                url: API_ENDPOINTS.SCENE_PARTNER.HISTORY,
                method: 'GET',
                params: params || undefined,
            }),
            providesTags: ['ScenePartnerHistory'],
        }),

        startSession: builder.mutation<ApiResponse<SceneSessionDto>, StartSceneSessionPayload>({
            query: (body) => ({
                url: API_ENDPOINTS.SCENE_PARTNER.SESSIONS,
                method: 'POST',
                body,
            }),
            invalidatesTags: ['ScenePartnerActive', 'ScenePartnerHistory'],
        }),

        sendTurn: builder.mutation<ApiResponse<SceneSessionDto>, SendSceneTurnPayload>({
            query: ({ sessionId, content }) => ({
                url: API_ENDPOINTS.SCENE_PARTNER.MESSAGE(sessionId),
                method: 'POST',
                body: { content },
            }),
            invalidatesTags: ['ScenePartnerActive'],
        }),

        pauseSession: builder.mutation<ApiResponse<SceneSessionDto>, SessionActionPayload>({
            query: ({ sessionId }) => ({
                url: API_ENDPOINTS.SCENE_PARTNER.PAUSE(sessionId),
                method: 'POST',
            }),
            invalidatesTags: ['ScenePartnerActive'],
        }),

        resumeSession: builder.mutation<ApiResponse<SceneSessionDto>, SessionActionPayload>({
            query: ({ sessionId }) => ({
                url: API_ENDPOINTS.SCENE_PARTNER.RESUME(sessionId),
                method: 'POST',
            }),
            invalidatesTags: ['ScenePartnerActive'],
        }),

        endSession: builder.mutation<ApiResponse<SceneSessionDto>, SessionActionPayload>({
            query: ({ sessionId }) => ({
                url: API_ENDPOINTS.SCENE_PARTNER.END(sessionId),
                method: 'POST',
            }),
            invalidatesTags: ['ScenePartnerActive', 'ScenePartnerHistory'],
        }),
    }),
});

export const {
    useGetScenariosQuery,
    useGetActiveSessionQuery,
    useGetSessionByIdQuery,
    useGetHistoryQuery,
    useStartSessionMutation,
    useSendTurnMutation,
    usePauseSessionMutation,
    useResumeSessionMutation,
    useEndSessionMutation,
} = scenePartnerApi;

