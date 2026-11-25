import { Inject, Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { IUserKycEscalatedEventPayload, KYC_ESCALATION_EVENTS } from "../../../../shared/domain/events/kyc-escalation-events.contract";
import { CREATE_KYC_ESCALATION_TASK_USE_CASE, ICreateKycEscalationTaskUseCase } from "../interfaces/create-kyc-task.use-case.interface";

@Injectable()
export class UserKycEscalatedListener {
    private readonly _logger = new Logger(UserKycEscalatedListener.name);

    constructor(
        @Inject(CREATE_KYC_ESCALATION_TASK_USE_CASE) private readonly _createTaskUseCase: ICreateKycEscalationTaskUseCase,
    ) { }

    @OnEvent(KYC_ESCALATION_EVENTS.USER_KYC_ESCALATED, { async: true })
    async handle(event: IUserKycEscalatedEventPayload): Promise<void> {
        this._logger.log(`Received KYC escalation event for user ${event.targetUserId}`);

        try {
            await this._createTaskUseCase.execute(
                event.targetUserId,
                event.documentType,
                event.issuingCountry,
                event.kycSelfieUrl,
                event.uploadedDocumentUrl,
                event.livenessScore,
                event.faceMatchScore,
                event.legalName
            );
        } catch (error: unknown) {
            this._logger.error(
                `Failed to create KYC escalation task for user ${event.targetUserId}`,
                error instanceof Error ? error.stack : String(error)
            );
        }
    }
}
