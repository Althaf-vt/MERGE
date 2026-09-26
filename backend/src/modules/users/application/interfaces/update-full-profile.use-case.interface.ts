import { UpdateFullProfileDto } from "../dtos/update-full-profile.dto";

export const UPDATE_FULL_PROFILE_USE_CASE = 'UPDATE_FULL_PROFILE_USE_CASE';

export interface IUpdateFullProfileUseCase {
    execute(userId: string, payload: UpdateFullProfileDto): Promise<void>;
}