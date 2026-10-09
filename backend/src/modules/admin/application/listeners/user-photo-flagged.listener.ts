import { Inject, Injectable, Logger } from "@nestjs/common";
import { CREATE_PHOTO_VERIFICATION_TASK_USE_CASE, ICreatePhotoVerificationTaskUseCase } from "../interfaces/photo-verification.use-case.interface";
import { OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class UserPhotoFlaggedListener{
    private readonly _logger = new Logger(UserPhotoFlaggedListener.name);

    constructor(
        @Inject(CREATE_PHOTO_VERIFICATION_TASK_USE_CASE) private readonly _createTaskUseCase: ICreatePhotoVerificationTaskUseCase
    ){}

    @OnEvent('user.photo.flagged', {async: true})
    async handle(event: any): Promise<void>{
        this._logger.log(`Received flagged photo event for user ${event.userId}, photo ${event.photoId}`);

        try {
            await this._createTaskUseCase.execute(
                event.userId,
                event.photoId,
                event.kycSelfieUrl,
                event.uploadedPhotoUrl,
                event.faceMatchScore
            )
        } catch (error: any) {
            this._logger.error(`Failed to create photo verification task for photo ${event.photoId}`, error.stack);
        }
    }
}