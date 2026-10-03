import { IBaseRepository } from "../../../../shared/domain/interfaces/base-repository.interface";
import { PhotoVerificationTask } from "../entities/photo-verification-task.entity";
import { PhotoTaskStatus } from "../enums/photo-task-status.enum";
import { ClaimStatus } from "../enums/claim-status.enum";

export const PHOTO_VERIFICATION_TASK_REPOSITORY = 'PHOTO_VERIFICATION_TASK_REPOSITORY';

export interface GetPhotoTasksFilters {
    page: number;
    limit: number;
    status?: PhotoTaskStatus;
    claimStatus?: ClaimStatus;
    claimedBy?: string;
}

export interface PaginatedPhotoTasksResult {
    data: PhotoVerificationTask[];
    total: number;
    page: number;
    limit: number;
}

export interface IPhotoVerificationTaskRepository extends IBaseRepository<PhotoVerificationTask> {
    findAllPaginated(filters: GetPhotoTasksFilters): Promise<PaginatedPhotoTasksResult>;
    // Checks if an active task already exists for a specific photo to prevent duplicates
    existsForPhoto(photoId: string): Promise<boolean>;
}