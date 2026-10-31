import { Inject, Injectable } from "@nestjs/common";
import { ISendPriorityIntroUseCase } from "../interfaces/connection.use-cases.interface";
import { CONNECTION_REPOSITORY, IConnectionRepository } from "../../domain/interfaces/connection-repository.interface";
import { IUserManagementFacade, USER_MANAGEMENT_FACADE } from "../../../users/application/interfaces/user-management-facade.interface";
import { BILLING_FACADE, IBillingFacade } from "../interfaces/billing-facade.interface";
import { SendPriorityIntroDto } from "../dtos/connection.dto";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { ConnectionAggregate } from "../../domain/entities/connection.entity";
import { CONNECTION_ERROR_MESSAGES } from "../../domain/constants/connection.constants";

@Injectable()
export class SendPriorityIntroUseCase implements ISendPriorityIntroUseCase {
    constructor(
        @Inject(CONNECTION_REPOSITORY) private readonly _connectionRepo: IConnectionRepository,
        @Inject(USER_MANAGEMENT_FACADE) private readonly _userFacade: IUserManagementFacade,
        @Inject(BILLING_FACADE) private readonly _billingFacade: IBillingFacade,
    ) { }

    async execute(requesterId: string, dto: SendPriorityIntroDto): Promise<void> {
        if (requesterId === dto.targetUserId) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, CONNECTION_ERROR_MESSAGES.CANNOT_INTERACT_WITH_YOURSELF);
        }

        const targetUser = await this._userFacade.getUserById(dto.targetUserId);
        if (!targetUser || targetUser.accountStatus !== 'ACTIVE') {
            throw new DomainException(ErrorCode.USER_NOT_FOUND, CONNECTION_ERROR_MESSAGES.TARGET_PROFILE_UNAVAILABLE);
        }

        const existingInteraction = await this._connectionRepo.findExistingInteraction(requesterId, dto.targetUserId);
        if (existingInteraction) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, CONNECTION_ERROR_MESSAGES.PRIORITY_INTERACTION_ALREADY_EXISTS);
        }

        // 1. Create and validate the Priority Request Aggregate first
        const newConnection = new ConnectionAggregate({
            requesterId,
            recipientId: dto.targetUserId,
            isPriority: true,
            icebreakerMessage: dto.icebreakerMessage.trim(),
        });

        // 2. Cross-Module Synchronous Call (deduct credit only after invariants pass)
        await this._billingFacade.deductPriorityCredit(requesterId);

        // 3. Persist the valid priority request
        await this._connectionRepo.create(newConnection);
    }
}