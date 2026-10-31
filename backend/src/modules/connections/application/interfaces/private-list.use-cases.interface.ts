import { AddToPrivateListDto } from "../dtos/private-list.dto";

export const ADD_TO_PRIVATE_LIST_USE_CASE = 'ADD_TO_PRIVATE_LIST_USE_CASE';
export const REMOVE_FROM_PRIVATE_LIST_USE_CASE = 'REMOVE_FROM_PRIVATE_LIST_USE_CASE';

export interface IAddToPrivateListUseCase {
    execute(userId: string, dto: AddToPrivateListDto): Promise<void>;
}

export interface IRemoveFromPrivateListUseCase {
    execute(userId: string, targetUserId: string): Promise<void>;
}