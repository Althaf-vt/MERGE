import { Inject, Injectable } from "@nestjs/common";
import { IAddToPrivateListUseCase } from "../interfaces/private-list.use-cases.interface";
import { IPrivateListRepository, PRIVATE_LIST_REPOSITORY } from "../../domain/interfaces/private-list-repository.interface";
import { AddToPrivateListDto } from "../dtos/private-list.dto";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { PrivateListAggregate } from "../../domain/entities/private-list.entity";
import { PrivateListType } from "../../domain/enums/private-list.enums";
import { IUserManagementFacade, USER_MANAGEMENT_FACADE } from "../../../users/application/interfaces/user-management-facade.interface";
import { PRIVATE_LIST_ERROR_MESSAGES } from "../../domain/constants/private-list.constants";

@Injectable()
export class AddToPrivateListUseCase implements IAddToPrivateListUseCase {
    constructor(
        @Inject(PRIVATE_LIST_REPOSITORY) private readonly _listRepo: IPrivateListRepository,
        @Inject(USER_MANAGEMENT_FACADE) private readonly _userFacade: IUserManagementFacade,
    ) {}

    async execute(userId: string, dto: AddToPrivateListDto): Promise<void> {
        if (userId === dto.targetUserId) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, PRIVATE_LIST_ERROR_MESSAGES.CANNOT_LIST_YOURSELF);
        }

        const targetUser = await this._userFacade.getUserById(dto.targetUserId);
        if (!targetUser || targetUser.accountStatus !== 'ACTIVE') {
            throw new DomainException(ErrorCode.USER_NOT_FOUND, PRIVATE_LIST_ERROR_MESSAGES.TARGET_PROFILE_UNAVAILABLE);
        }

        const existing = await this._listRepo.findExact(userId, dto.targetUserId);
        if (existing) {
            if (existing.listType === dto.listType) {
                return;
            }

            if (dto.listType === PrivateListType.SHORTLIST) {
                existing.moveToShortlist();
            } else {
                existing.moveToReviewLater();
            }

            await this._listRepo.update(existing);
            return;
        }

        const newEntry = PrivateListAggregate.create({
            userId,
            targetUserId: dto.targetUserId,
            listType: dto.listType,
        });

        await this._listRepo.create(newEntry);
    }
}