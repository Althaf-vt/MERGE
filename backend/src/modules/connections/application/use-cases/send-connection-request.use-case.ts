import { Inject, Injectable } from "@nestjs/common";
import { ISendConnectionRequestUseCase, SendConnectionRequestResult } from "../interfaces/connection.use-cases.interface";
import { CONNECTION_REPOSITORY, IConnectionRepository } from "../../domain/interfaces/connection-repository.interface";
import { IPublicProfileFacade, PUBLIC_PROFILE_FACADE } from "../../../users/application/interfaces/public-profile-facade.interface";
import { TargetUserDto } from "../dtos/connection.dto";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { ConnectionAggregate } from "../../domain/entities/connection.entity";
import { CONNECTION_ERROR_MESSAGES } from "../../domain/constants/connection.constants";

@Injectable()
export class SendConnectionRequestUseCase implements ISendConnectionRequestUseCase {
    constructor(
        @Inject(CONNECTION_REPOSITORY) private readonly _connectionRepo: IConnectionRepository,
        @Inject(PUBLIC_PROFILE_FACADE) private readonly _publicProfileFacade: IPublicProfileFacade,
    ) { }

    async execute(requesterId: string, dto: TargetUserDto): Promise<SendConnectionRequestResult> {
        if (requesterId === dto.targetUserId) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, CONNECTION_ERROR_MESSAGES.CANNOT_REQUEST_YOURSELF);
        }

        const isInteractable = await this._publicProfileFacade.isProfileInteractable(dto.targetUserId);
        if (!isInteractable) {
            throw new DomainException(ErrorCode.USER_NOT_FOUND, CONNECTION_ERROR_MESSAGES.TARGET_PROFILE_UNAVAILABLE);
        }

        const existingInteraction = await this._connectionRepo.findExistingInteraction(requesterId, dto.targetUserId);
        if (existingInteraction) {
            // Mutual Auto-Match: If the target user already sent a pending request to the current user,
            // this request confirms mutual interest and immediately forms an accepted match.
            if (existingInteraction.requesterId === dto.targetUserId && existingInteraction.isPending()) {
                existingInteraction.accept(requesterId);
                await this._connectionRepo.update(existingInteraction);
                return { isMatch: true };
            }

            throw new DomainException(ErrorCode.VALIDATION_FAILED, CONNECTION_ERROR_MESSAGES.INTERACTION_ALREADY_EXISTS);
        }

        const newConnection = ConnectionAggregate.create({
            requesterId,
            recipientId: dto.targetUserId,
        });

        await this._connectionRepo.create(newConnection);
        return { isMatch: false };
    }
}