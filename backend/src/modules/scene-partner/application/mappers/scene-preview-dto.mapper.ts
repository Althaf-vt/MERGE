import { SceneSession } from "../../domain/entities/scene-session.entity";
import { ScenePreviewResponseDto } from "../dtos/preview-session.dto";
import { SceneTurnResponseDto } from "../dtos/scene-session-response.dto";

export class ScenePreviewDtoMapper {
    public static toResponseDto(entity: SceneSession): ScenePreviewResponseDto {
        const snapshot = entity.toJSON();

        const transcript: SceneTurnResponseDto[] = snapshot.transcript.map((turn) => ({
            role: turn.role,
            content: turn.content,
            coachNote: turn.coachNote
                ? {
                    observation: turn.coachNote.observation,
                    tone: turn.coachNote.tone,
                    pacing: turn.coachNote.pacing,
                    nextTip: turn.coachNote.nextTip,
                }
                : null,
            timestamp: turn.timestamp,
        }));

        return {
            id: snapshot.id,
            scenarioId: snapshot.scenarioId,
            scenarioTitle: snapshot.scenarioTitle,
            scenarioCategory: snapshot.scenarioCategory,
            scenarioPromptContext: snapshot.scenarioPromptContext,
            isCoachingEnabled: snapshot.isCoachingEnabled,
            status: snapshot.status,
            transcript,
            turnCount: snapshot.turnCount,
            isPreview: snapshot.isPreview,
            createdAt: snapshot.createdAt,
            updatedAt: snapshot.updatedAt,
        };
    }
}
