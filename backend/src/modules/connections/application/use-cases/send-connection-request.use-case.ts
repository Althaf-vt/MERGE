import { Inject, Injectable } from "@nestjs/common";
import { ISendConnectionRequestUseCase } from "../interfaces/connection.use-cases.interface";
import { CONNECTION_REPOSITORY, IConnectionRepository } from "../../domain/interfaces/connection-repository.interface";
import { IUserManagementFacade, USER_MANAGEMENT_FACADE } from "../../../users/application/interfaces/user-management-facade.interface";
import { TargetUserDto } from "../dtos/connection.dto";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { ConnectionAggregate } from "../../domain/entities/connection.entity";
import { ConnectionStatus } from "../../domain/enums/connection.enums";

@Injectable()
export class SendConnectionRequestUseCase implements ISendConnectionRequestUseCase {
    constructor(
        @Inject(CONNECTION_REPOSITORY) private readonly _connectionRepo: IConnectionRepository,
        @Inject(USER_MANAGEMENT_FACADE) private readonly _userFacade: IUserManagementFacade,
    ) { }

    async execute(requesterId: string, dto: TargetUserDto): Promise<void> {
        if (requesterId === dto.targetUserId) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, "You cannot request yourself.");
        }

        const targetUser = await this._userFacade.getUserById(dto.targetUserId);
        if (!targetUser || targetUser.accountStatus !== 'ACTIVE') {
            throw new DomainException(ErrorCode.USER_NOT_FOUND, "Target profile is unavailable.");
        }

        const existingInteraction = await this._connectionRepo.findExistingInteraction(requesterId, dto.targetUserId);

        if (existingInteraction) {
            if (existingInteraction.requesterId === dto.targetUserId && existingInteraction.status === ConnectionStatus.PENDING) {
                existingInteraction.accept(requesterId);
                await this._connectionRepo.update(existingInteraction);
                return;
            }
            throw new DomainException(ErrorCode.VALIDATION_FAILED, `An active or pending interaction already exists with this user.`);
        }

        const newConnection = new ConnectionAggregate({
            requesterId,
            recipientId: dto.targetUserId,
            isPriority: false,
        });

        await this._connectionRepo.create(newConnection);
    }
}