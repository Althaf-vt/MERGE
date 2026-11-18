import { KycEscalationTask } from "../../domain/entities/kyc-escalation-task.entity";
import { KycEscalationTaskResponseDto } from "../dtos/kyc-escalation.dto";
import { IMediaFacade } from "../../../users/application/interfaces/media-facade.interface";
import { PaginatedKycTaskResult } from "../../domain/interfaces/kyc-escalation-task-repository.interface";
import { PaginatedHydratedKycTasks } from "../interfaces/kyc-escalation.use-case.interface";

export class KycEscalationDtoMapper {
    public static toResponseDto(
        entity: KycEscalationTask,
        signedSelfieUrl?: string,
        signedDocumentUrl?: string,
    ): KycEscalationTaskResponseDto {
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

    public static toResponseDtoList(entities: KycEscalationTask[]): KycEscalationTaskResponseDto[] {
        return entities.map((entity) => KycEscalationDtoMapper.toResponseDto(entity));
    }

    public static async toHydratedResponseDto(
        entity: KycEscalationTask,
        mediaFacade: IMediaFacade,
    ): Promise<KycEscalationTaskResponseDto> {
        const [signedSelfieUrl, signedDocumentUrl] = await Promise.all([
            mediaFacade.getPresignedMediaUrl(entity.kycSelfieUrl),
            mediaFacade.getPresignedMediaUrl(entity.uploadedDocumentUrl),
        ]);

        return KycEscalationDtoMapper.toResponseDto(
            entity,
            signedSelfieUrl || entity.kycSelfieUrl,
            signedDocumentUrl || entity.uploadedDocumentUrl,
        );
    }

    public static async toHydratedResponseDtoList(
        entities: KycEscalationTask[],
        mediaFacade: IMediaFacade,
    ): Promise<KycEscalationTaskResponseDto[]> {
        return Promise.all(
            entities.map((entity) => KycEscalationDtoMapper.toHydratedResponseDto(entity, mediaFacade)),
        );
    }

    public static async toPaginatedResponseDto(
        result: PaginatedKycTaskResult,
        mediaFacade: IMediaFacade,
    ): Promise<PaginatedHydratedKycTasks> {
        const data = await KycEscalationDtoMapper.toHydratedResponseDtoList(result.data, mediaFacade);
        return {
            data,
            total: result.total,
            page: result.page,
            limit: result.limit,
        };
    }
}
