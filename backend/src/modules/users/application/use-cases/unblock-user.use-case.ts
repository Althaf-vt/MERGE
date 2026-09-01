import { Inject, Injectable } from "@nestjs/common";
import { IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { IUnblockUserUseCase } from "../interfaces/block-management.use-case.interface";
import { BLOCKED_RELATIONSHIP_REPOSITORY, IBlockedRelationshipRepository } from "../../domain/interfaces/blocked-relationship-repository.interface";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";

@Injectable()
export class UnblockUserUseCase implements IUnblockUserUseCase {
    constructor(
        @Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository,
        @Inject(BLOCKED_RELATIONSHIP_REPOSITORY) private readonly _blockRepo: IBlockedRelationshipRepository,
    ) {}

    async execute(blockerId: string, blockedId: string): Promise<void> {
        const user = await this._userRepository.findById(blockerId);
        if (!user) throw new DomainException(ErrorCode.USER_NOT_FOUND, 'User not found.');

        // Guard: Verify the block actually exists before attempting to unblock
        const existingBlock = await this._blockRepo.findByPair(blockerId, blockedId);
        if (!existingBlock) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, 'No active block found for this profile.');
        }

        user.unblockUser(blockedId);

        await this._blockRepo.delete(blockerId, blockedId);

        await this._userRepository.update(user);
    }
}