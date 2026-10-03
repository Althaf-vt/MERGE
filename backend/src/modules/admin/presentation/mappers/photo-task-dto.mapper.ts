import { PhotoVerificationTaskResponseDto } from "../../application/dtos/photo-verification.dto";
import { PhotoVerificationTask } from "../../domain/entities/photo-verification-task.entity";

export class PhotoTaskDtoMapper {
    public static toResponseDto(entity: PhotoVerificationTask): PhotoVerificationTaskResponseDto {
        return {
            id: entity.id,
            targetUserId: entity.targetUserId,
            photoId: entity.photoId,
            kycSelfieUrl: entity.kycSelfieUrl,
            uploadedPhotoUrl: entity.uploadedPhotoUrl,
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
}