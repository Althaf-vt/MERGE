import { Inject, Injectable } from "@nestjs/common";
import { ISendPriorityIntroUseCase } from "../interfaces/priority-intro.use-cases.interface";
import { IPriorityIntroRepository, PRIORITY_INTRO_REPOSITORY } from "../../domain/interfaces/priority-intro-repository.interface";
import { IUserManagementFacade, USER_MANAGEMENT_FACADE } from "../../../users/application/interfaces/user-management-facade.interface";
import { BILLING_FACADE, IBillingFacade } from "../interfaces/billing-facade.interface";
import { SendPriorityIntroDto } from "../dtos/priority-intro.dto";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { PriorityIntroAggregate } from "../../domain/entities/priority-intro.entity";
import { PRIORITY_INTRO_ERROR_MESSAGES } from "../../domain/constants/priority-intro.constants";

@Injectable()
export class SendPriorityIntroUseCase implements ISendPriorityIntroUseCase {
    constructor(
        @Inject(PRIORITY_INTRO_REPOSITORY) private readonly _priorityIntroRepo: IPriorityIntroRepository,
        @Inject(USER_MANAGEMENT_FACADE) private readonly _userFacade: IUserManagementFacade,
        @Inject(BILLING_FACADE) private readonly _billingFacade: IBillingFacade,
    ) { }

    async execute(requesterId: string, dto: SendPriorityIntroDto): Promise<void> {
        // 1. Create and validate domain invariants (valid IDs, not self, valid message length)
        const intro = PriorityIntroAggregate.send({
            senderId: requesterId,
            recipientId: dto.targetUserId,
            icebreakerMessage: dto.icebreakerMessage,
        });

        // 2. Validate target user active status
        const targetUser = await this._userFacade.getUserById(dto.targetUserId);
        if (!targetUser || targetUser.accountStatus !== 'ACTIVE') {
            throw new DomainException(ErrorCode.USER_NOT_FOUND, PRIORITY_INTRO_ERROR_MESSAGES.TARGET_PROFILE_UNAVAILABLE);
        }

        // 3. Synchronous cross-module call to deduct credit
        await this._billingFacade.deductPriorityCredit(requesterId);

        // 4. Persist independent priority intro (dispatches PriorityIntroSentDomainEvent)
        await this._priorityIntroRepo.create(intro);
    }
}