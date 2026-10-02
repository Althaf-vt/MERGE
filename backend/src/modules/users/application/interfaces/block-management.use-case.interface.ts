import { BlockedUserResponseDto, BlockUserDto } from "../dtos/block-management.dto";
import { SortOrder } from "../../domain/enums/user.enums";

export const BLOCK_USER_USE_CASE = 'BLOCK_USER_USE_CASE';
export const UNBLOCK_USER_USE_CASE = 'UNBLOCK_USER_USE_CASE';
export const GET_BLOCKED_USERS_USE_CASE = 'GET_BLOCKED_USERS_USE_CASE';

export interface IBlockUserUseCase {
    execute(blockerId: string, dto: BlockUserDto): Promise<void>;
}

export interface IUnblockUserUseCase {
    execute(blockerId: string, blockedId: string): Promise<void>;
}

export interface IGetBlockedUsersUseCase {
    execute(blockerId: string, search?: string, sortBy?: SortOrder): Promise<BlockedUserResponseDto[]>;
}