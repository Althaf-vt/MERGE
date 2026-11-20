import { SceneSessionResponseDto } from "../dtos/scene-session-response.dto";

export const GET_SESSION_BY_ID_USE_CASE = "GET_SESSION_BY_ID_USE_CASE";

export interface IGetSessionByIdUseCase {
    execute(sessionId: string): Promise<SceneSessionResponseDto | null>;
}
