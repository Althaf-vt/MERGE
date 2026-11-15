// RTK Query API slice for Scene Partner Admin features.

import { adminRootApi } from '../../auth/api/admin-base-api';
import { API_ENDPOINTS } from '../../../../shared/constants/api-endpoints.constant';
import type { ApiResponse } from '../../../../shared/types/api-response.types';
import type {
    AdminAuditLogDto,
    AdminPreviewSessionDto,
    AdminScenarioDto,
    AdminScenarioExportItemDto,
    AdminScenarioInDepthDto,
    AdminSessionDetailDto,
    AdminSessionListItemDto,
    CreateScenarioPayload,
    ExportScenariosQuery,
    GetAdminScenariosQuery,
    GetAdminSessionsQuery,
    GetScenarioActivityHistoryQuery,
    GetScenarioInDepthQuery,
    ScenePartnerAnalyticsDto,
    SendPreviewTurnPayload,
    StartPreviewSessionPayload,
    ToggleScenarioStatusPayload,
    UpdateScenarioPayload,
} from '../types/admin-scene-partner.types';

// Inject Scene Partner endpoints into adminRootApi.
export const adminScenePartnerApi = adminRootApi.injectEndpoints({
    endpoints: (builder) => ({
        // Query to list scenarios with pagination, category, and status filters.
        getAdminScenarios: builder.query<ApiResponse<AdminScenarioDto[]>, GetAdminScenariosQuery | void>({
            query: (params) => ({
                url: API_ENDPOINTS.ADMIN.SCENE_PARTNER.SCENARIOS,
                method: 'GET',
                params: params ? params : undefined,
            }),
            providesTags: (result) =>
                result?.data
                    ? [
                          ...result.data.map(({ id }) => ({ type: 'AdminScenario' as const, id })),
                          { type: 'AdminScenario' as const, id: 'LIST' },
                      ]
                    : [{ type: 'AdminScenario' as const, id: 'LIST' }],
        }),

        // Query to get a single scenario by its ID.
        getAdminScenarioById: builder.query<ApiResponse<AdminScenarioDto>, string>({
            query: (id) => ({
                url: API_ENDPOINTS.ADMIN.SCENE_PARTNER.SCENARIO_BY_ID(id),
                method: 'GET',
            }),
            providesTags: (_result, _error, id) => [{ type: 'AdminScenario' as const, id }],
        }),

        // Query to get in-depth scenario analytics, trends, and recent sessions.
        getAdminScenarioInDepth: builder.query<
            ApiResponse<AdminScenarioInDepthDto>,
            { id: string; query?: GetScenarioInDepthQuery }
        >({
            query: ({ id, query }) => ({
                url: API_ENDPOINTS.ADMIN.SCENE_PARTNER.SCENARIO_IN_DEPTH(id),
                method: 'GET',
                params: query,
            }),
            providesTags: (_result, _error, { id }) => [{ type: 'AdminScenario' as const, id }],
        }),

        // Query to get audit activity logs for a specific scenario.
        getAdminScenarioActivityHistory: builder.query<
            ApiResponse<AdminAuditLogDto[]>,
            { id: string; query?: GetScenarioActivityHistoryQuery }
        >({
            query: ({ id, query }) => ({
                url: API_ENDPOINTS.ADMIN.SCENE_PARTNER.SCENARIO_ACTIVITY_HISTORY(id),
                method: 'GET',
                params: query,
            }),
            providesTags: (_result, _error, { id }) => [{ type: 'AdminScenario' as const, id: `${id}-HISTORY` }],
        }),

        // Query to list user rehearsal sessions across the platform.
        getAdminSessions: builder.query<ApiResponse<AdminSessionListItemDto[]>, GetAdminSessionsQuery | void>({
            query: (params) => ({
                url: API_ENDPOINTS.ADMIN.SCENE_PARTNER.SESSIONS,
                method: 'GET',
                params: params ? params : undefined,
            }),
            providesTags: (result) =>
                result?.data
                    ? [
                          ...result.data.map(({ id }) => ({ type: 'AdminSession' as const, id })),
                          { type: 'AdminSession' as const, id: 'LIST' },
                      ]
                    : [{ type: 'AdminSession' as const, id: 'LIST' }],
        }),

        // Query to inspect deep details, transcript, and telemetry of a session.
        getAdminSessionDetails: builder.query<ApiResponse<AdminSessionDetailDto>, string>({
            query: (id) => ({
                url: API_ENDPOINTS.ADMIN.SCENE_PARTNER.SESSION_BY_ID(id),
                method: 'GET',
            }),
            providesTags: (_result, _error, id) => [{ type: 'AdminSession' as const, id }],
        }),

        // Query to fetch aggregated platform analytics.
        getScenePartnerAnalytics: builder.query<ApiResponse<ScenePartnerAnalyticsDto>, void>({
            query: () => ({
                url: API_ENDPOINTS.ADMIN.SCENE_PARTNER.ANALYTICS,
                method: 'GET',
            }),
            providesTags: [{ type: 'AdminAnalytics' as const, id: 'GLOBAL' }],
        }),

        // Query to export scenario catalog in JSON or CSV format.
        exportScenarios: builder.query<
            ApiResponse<AdminScenarioExportItemDto[]> | string,
            ExportScenariosQuery | void
        >({
            query: (params) => ({
                url: API_ENDPOINTS.ADMIN.SCENE_PARTNER.SCENARIOS_EXPORT,
                method: 'GET',
                params: params ? params : undefined,
                responseHandler: async (response: Response) => {
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('text/csv')) {
                        return response.text();
                    }
                    return response.json();
                },
            }),
        }),

        // Mutation to create a new scenario.
        createScenario: builder.mutation<ApiResponse<AdminScenarioDto>, CreateScenarioPayload>({
            query: (body) => ({
                url: API_ENDPOINTS.ADMIN.SCENE_PARTNER.SCENARIOS,
                method: 'POST',
                body,
            }),
            invalidatesTags: [
                { type: 'AdminScenario' as const, id: 'LIST' },
                { type: 'AdminAnalytics' as const, id: 'GLOBAL' },
            ],
        }),

        // Mutation to update an existing scenario.
        updateScenario: builder.mutation<ApiResponse<AdminScenarioDto>, { id: string; body: UpdateScenarioPayload }>({
            query: ({ id, body }) => ({
                url: API_ENDPOINTS.ADMIN.SCENE_PARTNER.SCENARIO_BY_ID(id),
                method: 'PATCH',
                body,
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: 'AdminScenario' as const, id },
                { type: 'AdminScenario' as const, id: 'LIST' },
                { type: 'AdminScenario' as const, id: `${id}-HISTORY` },
            ],
        }),

        // Mutation to toggle scenario visibility status (enable or disable).
        toggleScenarioStatus: builder.mutation<
            ApiResponse<AdminScenarioDto>,
            { id: string; body: ToggleScenarioStatusPayload }
        >({
            query: ({ id, body }) => ({
                url: API_ENDPOINTS.ADMIN.SCENE_PARTNER.SCENARIO_STATUS(id),
                method: 'PATCH',
                body,
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: 'AdminScenario' as const, id },
                { type: 'AdminScenario' as const, id: 'LIST' },
                { type: 'AdminScenario' as const, id: `${id}-HISTORY` },
                { type: 'AdminAnalytics' as const, id: 'GLOBAL' },
            ],
        }),

        // Mutation to start an ephemeral preview simulation session.
        startPreviewSession: builder.mutation<ApiResponse<AdminPreviewSessionDto>, StartPreviewSessionPayload>({
            query: (payload) => ({
                url: payload.scenarioId
                    ? API_ENDPOINTS.ADMIN.SCENE_PARTNER.SCENARIO_PREVIEW_START(payload.scenarioId)
                    : API_ENDPOINTS.ADMIN.SCENE_PARTNER.PREVIEW_START,
                method: 'POST',
                body: payload,
            }),
        }),

        // Mutation to send a turn inside an active preview session.
        sendPreviewTurn: builder.mutation<
            ApiResponse<AdminPreviewSessionDto>,
            { sessionId: string; body: SendPreviewTurnPayload }
        >({
            query: ({ sessionId, body }) => ({
                url: API_ENDPOINTS.ADMIN.SCENE_PARTNER.PREVIEW_MESSAGE(sessionId),
                method: 'POST',
                body,
            }),
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetAdminScenariosQuery,
    useGetAdminScenarioByIdQuery,
    useGetAdminScenarioInDepthQuery,
    useGetAdminScenarioActivityHistoryQuery,
    useGetAdminSessionsQuery,
    useGetAdminSessionDetailsQuery,
    useGetScenePartnerAnalyticsQuery,
    useExportScenariosQuery,
    useLazyExportScenariosQuery,
    useCreateScenarioMutation,
    useUpdateScenarioMutation,
    useToggleScenarioStatusMutation,
    useStartPreviewSessionMutation,
    useSendPreviewTurnMutation,
} = adminScenePartnerApi;
