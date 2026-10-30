import { Inject, Injectable } from "@nestjs/common";
import { ISendPriorityIntroUseCase } from "../interfaces/connection.use-cases.interface";
import { CONNECTION_REPOSITORY, IConnectionRepository } from "../../domain/interfaces/connection-repository.interface";
import { IUserManagementFacade, USER_MANAGEMENT_FACADE } from "../../../users/application/interfaces/user-management-facade.interface";
import { BILLING_FACADE, IBillingFacade } from "../interfaces/billing-facade.interface";
import { SendPriorityIntroDto } from "../dtos/connection.dto";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { ConnectionAggregate } from "../../domain/entities/connection.entity";

@Injectable()
export class SendPriorityIntroUseCase implements ISendPriorityIntroUseCase {
    constructor(
        @Inject(CONNECTION_REPOSITORY) private readonly _connectionRepo: IConnectionRepository,
        @Inject(USER_MANAGEMENT_FACADE) private readonly _userFacade: IUserManagementFacade,
        @Inject(BILLING_FACADE) private readonly _billingFacade: IBillingFacade,
    ) { }

    async execute(requesterId: string, dto: SendPriorityIntroDto): Promise<void> {
        if (requesterId === dto.targetUserId) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, "You cannot interact with yourself.");
        }

        const targetUser = await this._userFacade.getUserById(dto.targetUserId);
        if (!targetUser || targetUser.accountStatus !== 'ACTIVE') {
            throw new DomainException(ErrorCode.USER_NOT_FOUND, "Target profile is unavailable.");
        }

        const existingInteraction = await this._connectionRepo.findExistingInteraction(requesterId, dto.targetUserId);
        if (existingInteraction) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, `An interaction already exists. Save your credit.`);
        }

        // 1. Cross-Module Synchronous Call 
        await this._billingFacade.deductPriorityCredit(requesterId);

        // 2. Create the Priority Request
        const newConnection = new ConnectionAggregate({
            requesterId,
            recipientId: dto.targetUserId,
            isPriority: true,
            icebreakerMessage: dto.icebreakerMessage.trim(),
        });

        await this._connectionRepo.create(newConnection);
    }
}