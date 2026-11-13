import { PaginatedSceneSessionsResponseDto, SceneSessionResponseDto } from "../dtos/scene-session-response.dto";

export const SCENE_PARTNER_FACADE = "SCENE_PARTNER_FACADE";

export interface IScenePartnerFacade {
    getActiveSessionForUser(userId: string): Promise<SceneSessionResponseDto | null>;
    getSessionById(sessionId: string): Promise<SceneSessionResponseDto | null>;
    getUserSessions(userId: string, limit?: number, skip?: number): Promise<PaginatedSceneSessionsResponseDto>;
    getUserSessionCount(userId: string): Promise<number>;
}

