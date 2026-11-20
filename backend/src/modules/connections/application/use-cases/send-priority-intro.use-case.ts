import { Inject, Injectable } from "@nestjs/common";
import { ISendPriorityIntroUseCase } from "../interfaces/priority-intro.use-cases.interface";
import { IPriorityIntroRepository, PRIORITY_INTRO_REPOSITORY } from "../../domain/interfaces/priority-intro-repository.interface";
import { IPublicProfileFacade, PUBLIC_PROFILE_FACADE } from "../../../users/application/interfaces/public-profile-facade.interface";
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
        @Inject(PUBLIC_PROFILE_FACADE) private readonly _publicProfileFacade: IPublicProfileFacade,
        @Inject(BILLING_FACADE) private readonly _billingFacade: IBillingFacade,
    ) { }

    async execute(requesterId: string, dto: SendPriorityIntroDto): Promise<void> {
        const intro = PriorityIntroAggregate.send({
            senderId: requesterId,
            recipientId: dto.targetUserId,
            icebreakerMessage: dto.icebreakerMessage,
        });

        const isInteractable = await this._publicProfileFacade.isProfileInteractable(dto.targetUserId);
        if (!isInteractable) {
            throw new DomainException(ErrorCode.USER_NOT_FOUND, PRIORITY_INTRO_ERROR_MESSAGES.TARGET_PROFILE_UNAVAILABLE);
        }

        await this._billingFacade.deductPriorityCredit(requesterId);

        await this._priorityIntroRepo.create(intro);
    }
}