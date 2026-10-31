import { IBaseRepository } from "../../../../shared/domain/interfaces/base-repository.interface";
import { PrivateListAggregate } from "../entities/private-list.entity";
import { PrivateListType } from "../enums/private-list.enums";

export const PRIVATE_LIST_REPOSITORY = 'PRIVATE_LIST_REPOSITORY';

export interface IPrivateListRepository extends IBaseRepository<PrivateListAggregate> {
    findExact(userId: string, targetUserId: string): Promise<PrivateListAggregate | null>;
    getPaginatedList(userId: string, listType: PrivateListType, page: number, limit: number): Promise<{ data: PrivateListAggregate[]; total: number }>;
    deleteExact(userId: string, targetUserId: string): Promise<void>;
}