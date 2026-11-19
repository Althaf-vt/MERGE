import { Inject, Injectable } from "@nestjs/common";
import { IBlockUserUseCase } from "../interfaces/block-management.use-case.interface";
import { IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { BLOCKED_RELATIONSHIP_REPOSITORY, IBlockedRelationshipRepository } from "../../domain/interfaces/blocked-relationship-repository.interface";
import { BlockUserDto } from "../dtos/block-management.dto";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { USER_ERROR_MESSAGES } from "../../domain/constants/user-error-messages.constant";

@Injectable()
export class BlockUserUseCase implements IBlockUserUseCase {
    constructor(
        @Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository,
        @Inject(BLOCKED_RELATIONSHIP_REPOSITORY) private readonly _blockRepo: IBlockedRelationshipRepository,
    ) { }

    async execute(blockerId: string, dto: BlockUserDto): Promise<void> {
        const user = await this._userRepository.findById(blockerId);
        if(!user) throw new DomainException(ErrorCode.USER_NOT_FOUND, USER_ERROR_MESSAGES.USER_NOT_FOUND);

        const targetUser = await this._userRepository.findById(dto.blockedId);
        if (!targetUser) throw new DomainException(ErrorCode.USER_NOT_FOUND, USER_ERROR_MESSAGES.TARGET_PROFILE_NOT_FOUND);

        const existingBlock = await this._blockRepo.findByPair(blockerId, dto.blockedId);
        if (existingBlock) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, USER_ERROR_MESSAGES.PROFILE_ALREADY_BLOCKED);
        }

        // execute domain behavior 
        const blockedRelationship = user.blockUser(dto.blockedId, dto.reason);

        await this._blockRepo.create(blockedRelationship);

        await this._userRepository.update(user);
    }
}