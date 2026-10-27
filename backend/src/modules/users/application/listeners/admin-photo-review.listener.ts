import { Inject, Injectable, Logger } from "@nestjs/common";
import { IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { OnEvent } from "@nestjs/event-emitter";
import {
    IPhotoApprovedEventPayload,
    IPhotoRejectedEventPayload,
    PHOTO_MODERATION_EVENTS,
} from "../../../../shared/domain/events/photo-moderation-events.contract";

@Injectable()
export class AdminPhotoReviewListener {
    private readonly _logger = new Logger(AdminPhotoReviewListener.name);

    constructor(
        @Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository,
    ) {}

    @OnEvent(PHOTO_MODERATION_EVENTS.ADMIN_PHOTO_APPROVED, { async: true })
    async handleApproved(event: IPhotoApprovedEventPayload): Promise<void> {
        this._logger.log(`Processing admin approval for photo ${event.photoId} (User: ${event.targetUserId})`);

        const user = await this._userRepository.findById(event.targetUserId);
        if (!user) return;

        user.appovePhoto(event.photoId);
        await this._userRepository.update(user);
    }

    @OnEvent(PHOTO_MODERATION_EVENTS.ADMIN_PHOTO_REJECTED, { async: true })
    async handleRejected(event: IPhotoRejectedEventPayload): Promise<void> {
        this._logger.log(`Processing admin rejection for photo ${event.photoId} (User: ${event.targetUserId})`);

        const user = await this._userRepository.findById(event.targetUserId);
        if (!user) return;

        user.rejectPhoto(event.photoId, event.reason);
        await this._userRepository.update(user);
    }
}