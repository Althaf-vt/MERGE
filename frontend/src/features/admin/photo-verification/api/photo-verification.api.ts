import { adminRootApi } from '../../auth/api/admin-base-api';
import type { 
    GetPhotoTasksParams, 
    PaginatedPhotoTasksResponse, 
    RejectPhotoTaskPayload 
} from '../types/photo-verification.types';

export const adminPhotoVerificationApi = adminRootApi.injectEndpoints({
    endpoints: (builder) => ({
        getPhotoTasks: builder.query<PaginatedPhotoTasksResponse, GetPhotoTasksParams>({
            query: (params) => ({
                url: '/admin/photo-verification',
                method: 'GET',
                params,
            }),
            // Auto-refetch when tasks are mutated
            providesTags: (result) => 
                result 
                    ? [
                        ...result.data.map(({ id }) => ({ type: 'PhotoTasks' as const, id })),
                        { type: 'PhotoTasks', id: 'LIST' }
                      ]
                    : [{ type: 'PhotoTasks', id: 'LIST' }],
        }),

        claimTask: builder.mutation<{ success: boolean; message: string }, string>({
            query: (taskId) => ({
                url: `/admin/photo-verification/${taskId}/claim`,
                method: 'POST',
            }),
            invalidatesTags: (_result, _error, taskId) => [{ type: 'PhotoTasks', id: taskId }],
        }),

        releaseTask: builder.mutation<{ success: boolean; message: string }, string>({
            query: (taskId) => ({
                url: `/admin/photo-verification/${taskId}/release`,
                method: 'POST',
            }),
            invalidatesTags: (_result, _error, taskId) => [{ type: 'PhotoTasks', id: taskId }],
        }),

        takeoverTask: builder.mutation<{ success: boolean; message: string }, string>({
            query: (taskId) => ({
                url: `/admin/photo-verification/${taskId}/takeover`,
                method: 'POST',
            }),
            invalidatesTags: (_result, _error, taskId) => [{ type: 'PhotoTasks', id: taskId }],
        }),

        approvePhoto: builder.mutation<{ success: boolean; message: string }, string>({
            query: (taskId) => ({
                url: `/admin/photo-verification/${taskId}/approve`,
                method: 'POST',
            }),
            // Invalidates the specific task and the list to reflect the status change
            invalidatesTags: (_result, _error, taskId) => [
                { type: 'PhotoTasks', id: taskId },
                { type: 'PhotoTasks', id: 'LIST' }
            ],
        }),

        rejectPhoto: builder.mutation<{ success: boolean; message: string }, RejectPhotoTaskPayload>({
            query: ({ taskId, reason }) => ({
                url: `/admin/photo-verification/${taskId}/reject`,
                method: 'POST',
                body: { reason },
            }),
            invalidatesTags: (_result, _error, { taskId }) => [
                { type: 'PhotoTasks', id: taskId },
                { type: 'PhotoTasks', id: 'LIST' }
            ],
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetPhotoTasksQuery,
    useClaimTaskMutation,
    useReleaseTaskMutation,
    useTakeoverTaskMutation,
    useApprovePhotoMutation,
    useRejectPhotoMutation,
} = adminPhotoVerificationApi;