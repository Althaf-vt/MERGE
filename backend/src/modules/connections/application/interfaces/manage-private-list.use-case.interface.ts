import { PrivateListType } from "../../domain/enums/connection.enums";
import { TargetUserDto } from "../dtos/connection.dto";

export const MANAGE_PRIVATE_LIST_USE_CASE = 'MANAGE_PRIVATE_LIST_USE_CASE';

export interface IManagePrivateListUseCase {
    addToList(userId: string, listType: PrivateListType, dto: TargetUserDto): Promise<void>;
    removeFromList(userId: string, targetUserId: string): Promise<void>;
}