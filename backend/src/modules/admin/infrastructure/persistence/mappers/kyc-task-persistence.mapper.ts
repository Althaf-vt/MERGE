import { KycEscalationTask } from "../../../domain/entities/kyc-escalation-task.entity";
import { KycTaskStatus } from "../../../domain/enums/kyc-task-status.enum";
import { ClaimStatus } from "../../../domain/enums/claim-status.enum";
import { KycResubmissionReason } from "../../../domain/enums/kyc-resubmission-reason.enum";
import { ClaimDetailsVO } from "../../../domain/value-objects/claim-details.vo";
import { KycEscalationTaskDocument } from "../kyc-escalation-task.schema";

export class KycTaskPersistenceMapper {
    public static toDomain(raw: KycEscalationTaskDocument): KycEscalationTask {
        const claimVO = new ClaimDetailsVO(
            raw.claimDetails.status as ClaimStatus,
            raw.claimDetails.claimedBy,
            raw.claimDetails.claimedAt
        );

        return new KycEscalationTask({
            id: raw._id.toString(),
            targetUserId: raw.targetUserId,
            documentType: raw.documentType,
            issuingCountry: raw.issuingCountry,
            kycSelfieUrl: raw.kycSelfieUrl,
            uploadedDocumentUrl: raw.uploadedDocumentUrl,
            livenessScore: raw.livenessScore,
            faceMatchScore: raw.faceMatchScore,
            legalName: raw.legalName ?? null,
            taskStatus: raw.taskStatus as KycTaskStatus,
            claimDetails: claimVO,
            rejectionReason: raw.rejectionReason ?? undefined,
            resubmissionReasons: (raw.resubmissionReasons as KycResubmissionReason[]) ?? undefined,
            resubmissionMessage: raw.resubmissionMessage ?? null,
            resolvedAt: raw.resolvedAt ?? null,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        });
    }

    public static toDomainList(documents: KycEscalationTaskDocument[]): KycEscalationTask[] {
        return documents.map((doc) => KycTaskPersistenceMapper.toDomain(doc));
    }

    public static toPersistence(entity: KycEscalationTask): Record<string, unknown> {
        const json = entity.toJSON();
        return {
            targetUserId: json.targetUserId,
            documentType: json.documentType,
            issuingCountry: json.issuingCountry,
            kycSelfieUrl: json.kycSelfieUrl,
            uploadedDocumentUrl: json.uploadedDocumentUrl,
            livenessScore: json.livenessScore,
            faceMatchScore: json.faceMatchScore,
            legalName: json.legalName ?? null,
            taskStatus: json.taskStatus,
            claimDetails: json.claimDetails,
            rejectionReason: json.rejectionReason ?? null,
            resubmissionReasons: json.resubmissionReasons ?? [],
            resubmissionMessage: json.resubmissionMessage ?? null,
            resolvedAt: json.resolvedAt ?? null,
        };
    }
}
