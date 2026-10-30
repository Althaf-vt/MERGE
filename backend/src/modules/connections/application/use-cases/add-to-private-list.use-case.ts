import { Inject, Injectable } from "@nestjs/common";
import { IAddToPrivateListUseCase } from "../interfaces/private-list.use-cases.interface";
import { IPrivateListRepository, PRIVATE_LIST_REPOSITORY } from "../../domain/interfaces/private-list-repository.interface";
import { TargetUserDto } from "../dtos/connection.dto";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { PrivateListAggregate } from "../../domain/entities/private-list.entity";
import { PrivateListType } from "../../domain/enums/connection.enums";
import { IUserManagementFacade, USER_MANAGEMENT_FACADE } from "../../../users/application/interfaces/user-management-facade.interface";

@Injectable()
export class AddToPrivateListUseCase implements IAddToPrivateListUseCase {
    constructor(
        @Inject(PRIVATE_LIST_REPOSITORY) private readonly _listRepo: IPrivateListRepository,
        @Inject(USER_MANAGEMENT_FACADE) private readonly _userFacade: IUserManagementFacade,
    ) {}

    async execute(userId: string, listType: PrivateListType, dto: TargetUserDto): Promise<void> {
        if (userId === dto.targetUserId) throw new DomainException(ErrorCode.VALIDATION_FAILED, "You cannot list yourself.");

        const targetUser = await this._userFacade.getUserById(dto.targetUserId);
        if (!targetUser || targetUser.accountStatus !== 'ACTIVE') {
            throw new DomainException(ErrorCode.USER_NOT_FOUND, "Target profile is unavailable.");
        }

        const existing = await this._listRepo.findExact(userId, dto.targetUserId);
        if (existing) {
            if (existing.listType !== listType) {
                await this._listRepo.deleteExact(userId, dto.targetUserId);
            } else {
                return; 
            }
        }

        const entry = new PrivateListAggregate({
            userId,
            targetUserId: dto.targetUserId,
            listType,
        });

        await this._listRepo.create(entry);
    }
}