import { UpdateLifestyleDto } from "../dtos/update-lifestyle.dto";
import { UserProfileProps } from "../../domain/entities/user-profile.entity";

export const UPDATE_LIFESTYLE_USE_CASE = Symbol('UPDATE_LIFESTYLE_USE_CASE');

export interface IUpdateLifestyleUseCase{
    execute(userId: string, payload: UpdateLifestyleDto): Promise<UserProfileProps>;
}