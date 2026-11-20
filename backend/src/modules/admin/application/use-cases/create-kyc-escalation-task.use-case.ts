import { Inject, Injectable } from "@nestjs/common";
import { IKycEscalationTaskRepository, KYC_ESCALATION_TASK_REPOSITORY } from "../../domain/interfaces/kyc-escalation-task-repository.interface";
import { KycEscalationTask } from "../../domain/entities/kyc-escalation-task.entity";
import { ICreateKycEscalationTaskUseCase } from "../interfaces/create-kyc-task.use-case.interface";

@Injectable()
export class CreateKycEscalationTaskUseCase implements ICreateKycEscalationTaskUseCase {
    constructor(
        @Inject(KYC_ESCALATION_TASK_REPOSITORY) private readonly _repository: IKycEscalationTaskRepository,
    ) { }

    async execute(
        targetUserId: string,
        documentType: string,
        issuingCountry: string,
        kycSelfieUrl: string,
        uploadedDocumentUrl: string,
        livenessScore: number,
        faceMatchScore: number
    ): Promise<void> {
        const exists = await this._repository.existsForUser(targetUserId);
        if (exists) {
            return;
        }

        const task = new KycEscalationTask({
            targetUserId,
            documentType,
            issuingCountry,
            kycSelfieUrl,
            uploadedDocumentUrl,
            livenessScore,
            faceMatchScore,
        });

        await this._repository.create(task);
    }
}
