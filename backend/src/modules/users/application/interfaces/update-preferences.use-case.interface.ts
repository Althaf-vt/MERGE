import { UpdatePreferencesDto } from "../dtos/update-preferences.dto";
import { UserPreferenceProps } from "../../domain/entities/user-preference.entity";

export const UPDATE_PREFERENCES_USE_CASE = Symbol('UPDATE_PREFERENCES_USE_CASE');

export interface IUpdatePreferencesUseCase {
    execute(userId: string, payload: UpdatePreferencesDto): Promise<UserPreferenceProps>;
}