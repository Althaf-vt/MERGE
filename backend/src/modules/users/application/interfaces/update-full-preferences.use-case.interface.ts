import { UpdateFullPreferencesDto } from "../dtos/update-full-preferences.dto";

export const UPDATE_FULL_PREFERENCES_USE_CASE = 'UPDATE_USER_PREFERENCES_USE_CASE';

export interface IUpdateFullPreferencesUseCase {
    execute(userId: string, dto: UpdateFullPreferencesDto): Promise<void>;
}