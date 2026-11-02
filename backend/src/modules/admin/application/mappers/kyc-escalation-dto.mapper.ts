import { KycEscalationTask } from "../../domain/entities/kyc-escalation-task.entity";
import { KycEscalationTaskResponseDto } from "../dtos/kyc-escalation.dto";

export class KycEscalationDtoMapper {
    public static toResponseDto(entity: KycEscalationTask, signedSelfieUrl?: string, signedDocumentUrl?: string): KycEscalationTaskResponseDto {
        return {
            id: entity.id,
            targetUserId: entity.targetUserId,
            documentType: entity.documentType,
            issuingCountry: entity.issuingCountry,
            kycSelfieUrl: signedSelfieUrl || entity.kycSelfieUrl,
            uploadedDocumentUrl: signedDocumentUrl || entity.uploadedDocumentUrl,
            livenessScore: entity.livenessScore,
            faceMatchScore: entity.faceMatchScore,
            taskStatus: entity.taskStatus,
            claimStatus: entity.claimDetails.status,
            claimedBy: entity.claimDetails.claimedBy,
            rejectionReason: entity.rejectionReason,
            resubmissionReasons: entity.resubmissionReasons,
            resubmissionMessage: entity.resubmissionMessage,
            resolvedAt: entity.resolvedAt,
            createdAt: entity.createdAt,
        };
    }
}