import { Inject, Injectable } from "@nestjs/common";
import { IGetBlockedUsersUseCase } from "../interfaces/block-management.use-case.interface";
import { BLOCKED_RELATIONSHIP_REPOSITORY, IBlockedRelationshipRepository } from "../../domain/interfaces/blocked-relationship-repository.interface";
import { IStorageService, STORAGE_SERVICE } from "../interfaces/storage-service.interface";
import { SortOrder } from "../../domain/enums/user.enums";
import { BlockedUserResponseDto } from "../dtos/block-management.dto";
import { model } from "mongoose";

@Injectable()
export class GetBlockedUsersUseCase implements IGetBlockedUsersUseCase {
    constructor(
        @Inject(BLOCKED_RELATIONSHIP_REPOSITORY) private readonly _blockRepo: IBlockedRelationshipRepository,
        @Inject(STORAGE_SERVICE) private readonly _storageService: IStorageService,
    ) { }

    async execute(blockerId: string, search?: string, sortBy?: SortOrder): Promise<BlockedUserResponseDto[]> {
        // Query the highly-optimized Read Model directly from the DB
        const readModels = await this._blockRepo.getHydratedBlockedUsers(blockerId, { search, sortBy });

        // Map over the results concurrently to orchestrate cryptographic URL signing
        const responseData: BlockedUserResponseDto[] = await Promise.all(
            readModels.map(async (model) => {
                let secureAvatarUrl = null;

                if (model.avatarUrl) {
                    secureAvatarUrl = await this._storageService.getPresignedUrl(model.avatarUrl, 900);
                }

                // Format the location string, if available
                let locationStr: string | undefined = undefined;
                if (model.city) {
                    locationStr = `${model.city}${model.state ? `${model.state}` : ''}`;
                }

                return {
                    blockedId: model.blockedId,
                    displayName: model.isDeleted ? 'Account Deleted' : (model.displayName || 'Unknown Profile'),
                    genderIdentity: model.genderIdentity || undefined,
                    customLabel: model.customLabel || undefined,
                    location: locationStr,
                    avatarUrl: secureAvatarUrl,
                    reason: model.reason,
                    blockedAt: model.blockedAt,
                    isDeleted: model.isDeleted,
                }
            })
        );

        return responseData;
    }
}