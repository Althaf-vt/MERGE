import { UpdateLifestyleDto } from "../dtos/update-lifestyle.dto";
import { UserProfileResponseDto } from "../dtos/user-profile-response.dto";

export const UPDATE_LIFESTYLE_USE_CASE = Symbol('UPDATE_LIFESTYLE_USE_CASE');

export interface IUpdateLifestyleUseCase {
    execute(userId: string, payload: UpdateLifestyleDto): Promise<UserProfileResponseDto>;
}
