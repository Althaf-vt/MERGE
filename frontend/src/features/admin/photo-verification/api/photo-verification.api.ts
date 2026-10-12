import { API_ENDPOINTS } from '../../../../shared/constants/api-endpoints.constant';
import type { ApiResponse } from '../../../../shared/types/api-response.types';
import { adminRootApi } from '../../auth/api/admin-base-api';
import type {
    GetPhotoTasksQueryParams,
    PhotoVerificationTask,
    RejectPhotoTaskPayload,
} from '../types/photo-verification.types';

export const photoVerificationApi = adminRootApi.injectEndpoints({
    endpoints: (builder) => ({
        getPhotoTasks: builder.query<ApiResponse<PhotoVerificationTask[]>, GetPhotoTasksQueryParams>({
            query: (params) => ({
                url: API_ENDPOINTS.ADMIN.PHOTO_VERIFICATION.BASE,
                method: 'GET',
                params,
            }),
            providesTags: ['PhotoTasks'],
        }),

        claimTask: builder.mutation<ApiResponse<undefined>, string>({
            query: (taskId) => ({
                url: API_ENDPOINTS.ADMIN.PHOTO_VERIFICATION.CLAIM(taskId),
                method: 'POST',
            }),
            invalidatesTags: ['PhotoTasks'],
        }),

        releaseTask: builder.mutation<ApiResponse<undefined>, string>({
            query: (taskId) => ({
                url: API_ENDPOINTS.ADMIN.PHOTO_VERIFICATION.RELEASE(taskId),
                method: 'POST',
            }),
            invalidatesTags: ['PhotoTasks'],
        }),

        takeoverTask: builder.mutation<ApiResponse<undefined>, string>({
            query: (taskId) => ({
                url: API_ENDPOINTS.ADMIN.PHOTO_VERIFICATION.TAKEOVER(taskId),
                method: 'POST',
            }),
            invalidatesTags: ['PhotoTasks'],
        }),

        approvePhoto: builder.mutation<ApiResponse<undefined>, string>({
            query: (taskId) => ({
                url: API_ENDPOINTS.ADMIN.PHOTO_VERIFICATION.APPROVE(taskId),
                method: 'POST',
            }),
            invalidatesTags: ['PhotoTasks'],
        }),

        rejectPhoto: builder.mutation<ApiResponse<undefined>, RejectPhotoTaskPayload>({
            query: ({ taskId, reason }) => ({
                url: API_ENDPOINTS.ADMIN.PHOTO_VERIFICATION.REJECT(taskId),
                method: 'POST',
                body: { reason },
            }),
            invalidatesTags: ['PhotoTasks'],
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
} = photoVerificationApi;