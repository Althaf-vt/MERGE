import { KycEscalationTaskResponseDto } from "../../application/dtos/kyc-escalation.dto";
import { HydratedKycTaskResult } from "../../application/interfaces/kyc-escalation.use-case.interface";

export class KycEscalationDtoMapper {
    public static toResponseDto(item: HydratedKycTaskResult): KycEscalationTaskResponseDto {
        return {
            id: item.task.id,
            targetUserId: item.task.targetUserId,
            documentType: item.task.documentType,
            issuingCountry: item.task.issuingCountry,
            kycSelfieUrl: item.signedSelfieUrl,
            uploadedDocumentUrl: item.signedDocumentUrl,
            livenessScore: item.task.livenessScore,
            faceMatchScore: item.task.faceMatchScore,
            taskStatus: item.task.taskStatus,
            claimStatus: item.task.claimDetails.status,
            claimedBy: item.task.claimDetails.claimedBy,
            rejectionReason: item.task.rejectionReason,
            resolvedAt: item.task.resolvedAt,
            createdAt: item.task.createdAt,
        };
    }
}