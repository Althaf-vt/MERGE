import { UpdatePreferencesDto } from "../dtos/update-preferences.dto";

export const UPDATE_PREFERENCES_USE_CASE = Symbol('UPDATE_PREFERENCES_USE_CASE');

export interface IUpdatePreferencesUseCase {
    execute(userId: string, payload: UpdatePreferencesDto): Promise<{
        success: boolean;
        message: string;
        preferences: any;
    }>
}