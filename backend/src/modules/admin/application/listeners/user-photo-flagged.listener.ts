import { Inject, Injectable, Logger } from "@nestjs/common";
import { CREATE_PHOTO_VERIFICATION_TASK_USE_CASE, ICreatePhotoVerificationTaskUseCase } from "../interfaces/photo-verification.use-case.interface";
import { OnEvent } from "@nestjs/event-emitter";
import { IUserPhotoFlaggedEventPayload, PHOTO_MODERATION_EVENTS } from "../../../../shared/domain/events/photo-moderation-events.contract";

@Injectable()
export class UserPhotoFlaggedListener {
    private readonly _logger = new Logger(UserPhotoFlaggedListener.name);

    constructor(
        @Inject(CREATE_PHOTO_VERIFICATION_TASK_USE_CASE) private readonly _createTaskUseCase: ICreatePhotoVerificationTaskUseCase
    ) {}

    @OnEvent(PHOTO_MODERATION_EVENTS.USER_PHOTO_FLAGGED, { async: true })
    async handle(event: IUserPhotoFlaggedEventPayload): Promise<void> {
        this._logger.log(`Received flagged photo event for user ${event.userId}, photo ${event.photoId}`);

        try {
            await this._createTaskUseCase.execute(
                event.userId,
                event.photoId,
                event.kycSelfieUrl,
                event.uploadedPhotoUrl,
                event.faceMatchScore
            );
        } catch (error: unknown) {
            this._logger.error(
                `Failed to create photo verification task for photo ${event.photoId}`, 
                error instanceof Error ? error.stack : String(error)
            );
        }
    }
}