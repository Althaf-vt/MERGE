import { IBaseRepository } from "../../../../shared/domain/interfaces/base-repository.interface";
import { PriorityIntroAggregate } from "../entities/priority-intro.entity";

export const PRIORITY_INTRO_REPOSITORY = 'PRIORITY_INTRO_REPOSITORY';

export interface IPriorityIntroRepository extends IBaseRepository<PriorityIntroAggregate> {
    findBySenderId(senderId: string): Promise<PriorityIntroAggregate[]>;
    findByRecipientId(recipientId: string): Promise<PriorityIntroAggregate[]>;
    findInteractedUserIds(userId: string): Promise<string[]>;
}