import { IBaseRepository } from "../../../../shared/domain/interfaces/base-repository.interface";
import { SceneSession } from "../entities/scene-session.entity";

export const SCENE_SESSION_REPOSITORY = 'SCENE_SESSION_REPOSITORY';

export interface PaginatedSceneSessionsResult {
    data: SceneSession[];
    total: number;
}

export interface ISceneSessionRepository extends IBaseRepository<SceneSession> {
    findActiveByUserId(userId: string): Promise<SceneSession | null>;
    findAllByUserId(userId: string, limit?: number, skip?: number): Promise<PaginatedSceneSessionsResult>;
}
