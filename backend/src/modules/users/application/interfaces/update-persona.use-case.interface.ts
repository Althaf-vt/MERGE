import { UpdatePersonaDto } from "../dtos/update-persona.dto";

export const UPDATE_PERSONA_USE_CASE = Symbol('UPDATE_PERSONA_USE_CASE');

export interface IUpdatePersonaUseCase{
    execute(userId: string, payload: UpdatePersonaDto): Promise<{
        success: boolean;
        message: string;
        profile: any;
        verifiedDOB?: Date;
    }>
}