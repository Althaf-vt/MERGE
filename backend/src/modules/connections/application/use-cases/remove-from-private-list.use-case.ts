import { Inject, Injectable } from "@nestjs/common";
import { IPrivateListRepository, PRIVATE_LIST_REPOSITORY } from "../../domain/interfaces/private-list-repository.interface";
import { IRemoveFromPrivateListUseCase } from "../interfaces/private-list.use-cases.interface";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { PRIVATE_LIST_ERROR_MESSAGES } from "../../domain/constants/private-list.constants";

@Injectable()
export class RemoveFromPrivateListUseCase implements IRemoveFromPrivateListUseCase {
    constructor(
        @Inject(PRIVATE_LIST_REPOSITORY) private readonly _listRepo: IPrivateListRepository,
    ) { }

    async execute(userId: string, targetUserId: string): Promise<void> {
        if (!userId?.trim() || !targetUserId?.trim()) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, PRIVATE_LIST_ERROR_MESSAGES.USER_AND_TARGET_REQUIRED);
        }

        await this._listRepo.deleteExact(userId.trim(), targetUserId.trim());
    }
}