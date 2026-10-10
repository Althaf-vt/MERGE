import { UpdatePersonaDto } from "../dtos/update-persona.dto";
import { UserProfileProps } from "../../domain/entities/user-profile.entity";

export const UPDATE_PERSONA_USE_CASE = Symbol('UPDATE_PERSONA_USE_CASE');

export interface UpdatePersonaResult {
    profile: UserProfileProps;
    verifiedDOB?: Date;
}

export interface IUpdatePersonaUseCase {
    execute(userId: string, payload: UpdatePersonaDto): Promise<UpdatePersonaResult>;
}