import { UpdatePersonaDto } from "../dtos/update-persona.dto";
import { UserProfileResponseDto } from "../dtos/user-profile-response.dto";

export const UPDATE_PERSONA_USE_CASE = Symbol('UPDATE_PERSONA_USE_CASE');

export interface UpdatePersonaResult {
    profile: UserProfileResponseDto;
    verifiedDOB?: Date;
}

export interface IUpdatePersonaUseCase {
    execute(userId: string, payload: UpdatePersonaDto): Promise<UpdatePersonaResult>;
}
