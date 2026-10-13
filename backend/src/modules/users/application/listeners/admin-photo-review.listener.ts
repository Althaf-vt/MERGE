import { Inject, Injectable, Logger } from "@nestjs/common";
import { IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { OnEvent } from "@nestjs/event-emitter";
import { PhotoApprovedDomainEvent } from "../../../admin/domain/events/photo-approved.domain-event";
import { PhotoRejectedDomainEvent } from "../../../admin/domain/events/photo-rejected.domain-event";

@Injectable()
export class AdminPhotoReviewListener{
    private readonly _logger = new Logger(AdminPhotoReviewListener.name);

    constructor(
        @Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository,
    ) {}

    @OnEvent('admin.photo.approved', {async: true})
    async handleApproved(event: PhotoApprovedDomainEvent): Promise<void>{
        this._logger.log(`Processing admin approval for photo ${event.photoId} (User: ${event.targetUserId})`);

        const user = await this._userRepository.findById(event.targetUserId);
        if(!user) return;

        user.appovePhoto(event.photoId);
        await this._userRepository.update(user);
    }

    @OnEvent('admin.photo.rejected', {async: true})
    async handleRejected(event: PhotoRejectedDomainEvent): Promise<void>{
        this._logger.log(`Processing admin rejection for photo ${event.photoId} (User: ${event.targetUserId})`);

        const user = await this._userRepository.findById(event.targetUserId);
        if(!user) return;

        user.rejectPhoto(event.photoId, event.reason);
        await this._userRepository.update(user);
    }
}