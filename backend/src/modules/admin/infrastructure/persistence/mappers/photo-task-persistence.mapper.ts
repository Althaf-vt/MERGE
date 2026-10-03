import { PhotoVerificationTask } from "../../../domain/entities/photo-verification-task.entity";
import { PhotoTaskStatus } from "../../../domain/enums/photo-task-status.enum";
import { ClaimStatus } from "../../../domain/enums/claim-status.enum";
import { ClaimDetailsVO } from "../../../domain/value-objects/claim-details.vo";
import { PhotoVerificationTaskDocument } from "../photo-verification-task.schema";

export class PhotoTaskPersistenceMapper {
    public static toDomain(raw: PhotoVerificationTaskDocument): PhotoVerificationTask {
        const claimVO = new ClaimDetailsVO(
            raw.claimDetails.status as ClaimStatus,
            raw.claimDetails.claimedBy,
            raw.claimDetails.claimedAt
        );

        return new PhotoVerificationTask({
            id: raw._id.toString(),
            targetUserId: raw.targetUserId,
            photoId: raw.photoId,
            kycSelfieUrl: raw.kycSelfieUrl,
            uploadedPhotoUrl: raw.uploadedPhotoUrl,
            faceMatchScore: raw.faceMatchScore,
            taskStatus: raw.taskStatus as PhotoTaskStatus,
            claimDetails: claimVO,
            rejectionReason: raw.rejectionReason,
            resolvedAt: raw.resolvedAt,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        });
    }

    public static toPersistence(entity: PhotoVerificationTask): any {
        const json = entity.toJSON();
        return {
            targetUserId: json.targetUserId,
            photoId: json.photoId,
            kycSelfieUrl: json.kycSelfieUrl,
            uploadedPhotoUrl: json.uploadedPhotoUrl,
            faceMatchScore: json.faceMatchScore,
            taskStatus: json.taskStatus,
            claimDetails: json.claimDetails,
            rejectionReason: json.rejectionReason ?? null,
            resolvedAt: json.resolvedAt ?? null,
        };
    }
}