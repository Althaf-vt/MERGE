import { CastingUserContextDto } from "../dtos/casting-user-context.dto";

export const CASTING_USER_FACADE = 'CASTING_USER_FACADE';

export interface IcastingUserFacade {
    getUserContextForCasting(userId: string): Promise<CastingUserContextDto | null>;
    markCastingComplete(userId: string, personalityVector: number[]): Promise<void>;
}