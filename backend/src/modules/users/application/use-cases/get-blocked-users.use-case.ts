import { Inject, Injectable } from "@nestjs/common";
import { IGetBlockedUsersUseCase } from "../interfaces/block-management.use-case.interface";
import { BLOCKED_RELATIONSHIP_REPOSITORY, IBlockedRelationshipRepository } from "../../domain/interfaces/blocked-relationship-repository.interface";
import { IStorageService, STORAGE_SERVICE } from "../interfaces/storage-service.interface";
import { SortOrder } from "../../domain/enums/user.enums";
import { BlockedUserResponseDto } from "../dtos/block-management.dto";
import { BlockedUserDtoMapper } from "../mappers/blocked-user-dto.mapper";

@Injectable()
export class GetBlockedUsersUseCase implements IGetBlockedUsersUseCase {
    constructor(
        @Inject(BLOCKED_RELATIONSHIP_REPOSITORY) private readonly _blockRepo: IBlockedRelationshipRepository,
        @Inject(STORAGE_SERVICE) private readonly _storageService: IStorageService,
    ) { }

    async execute(blockerId: string, search?: string, sortBy?: SortOrder): Promise<BlockedUserResponseDto[]> {
        const readModels = await this._blockRepo.getHydratedBlockedUsers(blockerId, { search, sortBy });
        return BlockedUserDtoMapper.toHydratedResponseDtoList(readModels, this._storageService);
    }
}
