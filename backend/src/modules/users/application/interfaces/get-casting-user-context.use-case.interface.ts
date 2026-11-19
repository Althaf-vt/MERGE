import { CastingUserContextDto } from "../dtos/casting-user-context.dto";

export const GET_CASTING_USER_CONTEXT_USE_CASE = Symbol('GET_CASTING_USER_CONTEXT_USE_CASE');

export interface IGetCastingUserContextUseCase {
    execute(userId: string): Promise<CastingUserContextDto | null>;
}

