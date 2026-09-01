import { Inject, Injectable } from "@nestjs/common";
import { IBlockUserUseCase } from "../interfaces/block-management.use-case.interface";
import { IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { BLOCKED_RELATIONSHIP_REPOSITORY, IBlockedRelationshipRepository } from "../../domain/interfaces/blocked-relationship-repository.interface";
import { BlockUserDto } from "../dtos/block-management.dto";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";

@Injectable()
export class BlockUserUseCase implements IBlockUserUseCase {
    constructor(
        @Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository,
        @Inject(BLOCKED_RELATIONSHIP_REPOSITORY) private readonly _blockRepo: IBlockedRelationshipRepository,
    ) { }

    async execute(blockerId: string, dto: BlockUserDto): Promise<void> {
        const user = await this._userRepository.findByEmail(blockerId);
        if(!user) throw new DomainException(ErrorCode.USER_NOT_FOUND, 'User not found.');

        const targetUser = await this._userRepository.findById(dto.blockedId);
        if (!targetUser) throw new DomainException(ErrorCode.USER_NOT_FOUND, 'Target profile does not exist.');

        const existingBlock = await this._blockRepo.findByPair(blockerId, dto.blockedId);
        if (existingBlock) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, 'This profile is already blocked.');
        }

        // execute domain behavior 
        const blockedRelationship = user.blockUser(dto.blockedId, dto.reason);

        await this._blockRepo.create(blockedRelationship);

        await this._userRepository.update(user);
    }
}