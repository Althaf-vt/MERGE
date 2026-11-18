import { PhotoVerificationTaskResponseDto } from "../dtos/photo-verification.dto";
import { PhotoVerificationTask } from "../../domain/entities/photo-verification-task.entity";
import { IMediaFacade } from "../../../users/application/interfaces/media-facade.interface";
import { PaginatedPhotoTasksResult } from "../../domain/interfaces/photo-verification-task-repository.interface";
import { PaginatedHydratedPhotoTasks } from "../interfaces/photo-verification.use-case.interface";

export class PhotoTaskDtoMapper {
    public static toResponseDto(
        entity: PhotoVerificationTask,
        signedKycUrl?: string, 
        signedUploadedUrl?: string
    ): PhotoVerificationTaskResponseDto {
        return {
            id: entity.id,
            targetUserId: entity.targetUserId,
            photoId: entity.photoId,
            kycSelfieUrl: signedKycUrl || entity.kycSelfieUrl,
            uploadedPhotoUrl: signedUploadedUrl || entity.uploadedPhotoUrl,
            faceMatchScore: entity.faceMatchScore,
            taskStatus: entity.taskStatus,
            claimStatus: entity.claimDetails.status,
            claimedBy: entity.claimDetails.claimedBy,
            claimedAt: entity.claimDetails.claimedAt,
            rejectionReason: entity.rejectionReason,
            resolvedAt: entity.resolvedAt,
            createdAt: entity.createdAt,
        };
    }

    public static toResponseDtoList(entities: PhotoVerificationTask[]): PhotoVerificationTaskResponseDto[] {
        return entities.map((entity) => PhotoTaskDtoMapper.toResponseDto(entity));
    }

    public static async toHydratedResponseDto(
        entity: PhotoVerificationTask,
        mediaFacade: IMediaFacade,
    ): Promise<PhotoVerificationTaskResponseDto> {
        const [signedKycUrl, signedUploadedUrl] = await Promise.all([
            mediaFacade.getPresignedMediaUrl(entity.kycSelfieUrl),
            mediaFacade.getPresignedMediaUrl(entity.uploadedPhotoUrl),
        ]);

        return PhotoTaskDtoMapper.toResponseDto(
            entity,
            signedKycUrl || entity.kycSelfieUrl,
            signedUploadedUrl || entity.uploadedPhotoUrl,
        );
    }

    public static async toHydratedResponseDtoList(
        entities: PhotoVerificationTask[],
        mediaFacade: IMediaFacade,
    ): Promise<PhotoVerificationTaskResponseDto[]> {
        return Promise.all(
            entities.map((entity) => PhotoTaskDtoMapper.toHydratedResponseDto(entity, mediaFacade)),
        );
    }

    public static async toPaginatedResponseDto(
        result: PaginatedPhotoTasksResult,
        mediaFacade: IMediaFacade,
    ): Promise<PaginatedHydratedPhotoTasks> {
        const data = await PhotoTaskDtoMapper.toHydratedResponseDtoList(result.data, mediaFacade);
        return {
            data,
            total: result.total,
            page: result.page,
            limit: result.limit,
        };
    }
}
