import { Inject, Injectable } from "@nestjs/common";
import { IAddToPrivateListUseCase } from "../interfaces/private-list.use-cases.interface";
import { IPrivateListRepository, PRIVATE_LIST_REPOSITORY } from "../../domain/interfaces/private-list-repository.interface";
import { AddToPrivateListDto } from "../dtos/private-list.dto";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { PrivateListAggregate } from "../../domain/entities/private-list.entity";
import { IUserManagementFacade, USER_MANAGEMENT_FACADE } from "../../../users/application/interfaces/user-management-facade.interface";
import { PRIVATE_LIST_ERROR_MESSAGES } from "../../domain/constants/private-list.constants";

@Injectable()
export class AddToPrivateListUseCase implements IAddToPrivateListUseCase {
    constructor(
        @Inject(PRIVATE_LIST_REPOSITORY) private readonly _listRepo: IPrivateListRepository,
        @Inject(USER_MANAGEMENT_FACADE) private readonly _userFacade: IUserManagementFacade,
    ) {}

    async execute(userId: string, dto: AddToPrivateListDto): Promise<void> {
        // Enforce domain invariants upfront (valid non-empty IDs, non-self listing, valid enum)
        const entry = new PrivateListAggregate({
            userId,
            targetUserId: dto.targetUserId,
            listType: dto.listType,
        });

        const targetUser = await this._userFacade.getUserById(entry.targetUserId);
        if (!targetUser || targetUser.accountStatus !== 'ACTIVE') {
            throw new DomainException(ErrorCode.USER_NOT_FOUND, PRIVATE_LIST_ERROR_MESSAGES.TARGET_PROFILE_UNAVAILABLE);
        }

        const existing = await this._listRepo.findExact(entry.userId, entry.targetUserId);
        if (existing) {
            if (existing.listType !== entry.listType) {
                await this._listRepo.deleteExact(entry.userId, entry.targetUserId);
            } else {
                return; 
            }
        }

        await this._listRepo.create(entry);
    }
}