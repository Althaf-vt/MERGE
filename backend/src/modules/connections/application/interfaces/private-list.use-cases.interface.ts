import { AddToPrivateListDto, GetPrivateListQueryDto, PaginatedPrivateListResponseDto } from "../dtos/private-list.dto";

export const ADD_TO_PRIVATE_LIST_USE_CASE = 'ADD_TO_PRIVATE_LIST_USE_CASE';
export const REMOVE_FROM_PRIVATE_LIST_USE_CASE = 'REMOVE_FROM_PRIVATE_LIST_USE_CASE';
export const GET_PRIVATE_LIST_USE_CASE = 'GET_PRIVATE_LIST_USE_CASE';

export interface IGetPrivateListUseCase {
    execute(userId: string, query: GetPrivateListQueryDto): Promise<PaginatedPrivateListResponseDto>;
}
export interface IAddToPrivateListUseCase {
    execute(userId: string, dto: AddToPrivateListDto): Promise<void>;
}

export interface IRemoveFromPrivateListUseCase {
    execute(userId: string, targetUserId: string): Promise<void>;
}