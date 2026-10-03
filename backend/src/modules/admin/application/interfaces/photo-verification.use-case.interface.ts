import { GetPhotoTasksQueryDto, PaginatedPhotoTasksResponseDto, RejectPhotoTaskDto } from "../dtos/photo-verification.dto";

export const GET_PHOTO_TASKS_USE_CASE = 'GET_PHOTO_TASKS_USE_CASE';
export const CLAIM_PHOTO_TASK_USE_CASE = 'CLAIM_PHOTO_TASK_USE_CASE';
export const RELEASE_PHOTO_TASK_CLAIM_USE_CASE = 'RELEASE_PHOTO_TASK_CLAIM_USE_CASE';
export const TAKEOVER_PHOTO_TASK_CLAIM_USE_CASE = 'TAKEOVER_PHOTO_TASK_CLAIM_USE_CASE';
export const APPROVE_PHOTO_VERIFICATION_USE_CASE = 'APPROVE_PHOTO_VERIFICATION_USE_CASE';
export const REJECT_PHOTO_VERIFICATION_USE_CASE = 'REJECT_PHOTO_VERIFICATION_USE_CASE';
export const CREATE_PHOTO_VERIFICATION_TASK_USE_CASE = 'CREATE_PHOTO_VERIFICATION_TASK_USE_CASE';

export interface IGetPhotoTasksUseCase {
    execute(query: GetPhotoTasksQueryDto): Promise<PaginatedPhotoTasksResponseDto>;
}

export interface IClaimPhotoTaskUseCase {
    execute(taskId: string, adminId: string): Promise<void>;
}

export interface IReleasePhotoTaskClaimUseCase {
    execute(taskId: string, adminId: string, isSuperAdmin: boolean): Promise<void>;
}

export interface ITakeoverPhotoTaskClaimUseCase {
    execute(taskId: string, superAdminId: string): Promise<void>;
}

export interface IApprovePhotoVerificationUseCase {
    execute(taskId: string, adminId: string, isSuperAdmin: boolean): Promise<void>;
}

export interface IRejectPhotoVerificationUseCase {
    execute(taskId: string, adminId: string, isSuperAdmin: boolean, dto: RejectPhotoTaskDto): Promise<void>;
}

export interface ICreatePhotoVerificationTaskUseCase {
    execute(targetUserId: string, photoId: string, kycSelfieUrl: string, uploadedPhotoUrl: string, faceMatchScore: number): Promise<void>;
}