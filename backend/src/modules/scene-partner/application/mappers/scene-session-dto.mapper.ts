import { SceneSession } from "../../domain/entities/scene-session.entity";
import { Scenario } from "../../domain/entities/scenario.entity";
import { PaginatedSceneSessionsResult } from "../../domain/interfaces/scene-session-repository.interface";
import { PaginatedSceneSessionsResponseDto, SceneSessionResponseDto, SceneTurnResponseDto } from "../dtos/scene-session-response.dto";
import { ScenarioResponseDto } from "../dtos/scenario-response.dto";

export class SceneSessionDtoMapper {
    public static toResponseDto(entity: SceneSession): SceneSessionResponseDto {
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
            userId: snapshot.userId,
            simulationType: snapshot.simulationType,
            scenarioId: snapshot.scenarioId,
            scenarioTitle: snapshot.scenarioTitle,
            scenarioCategory: snapshot.scenarioCategory,
            targetUserId: snapshot.targetUserId,
            status: snapshot.status,
            transcript,
            turnCount: snapshot.turnCount,
            summary: snapshot.summary
                ? {
                    summary: snapshot.summary.summary,
                    thingsToNote: [...snapshot.summary.thingsToNote],
                    takeaways: [...snapshot.summary.takeaways],
                    coachingNotes: snapshot.summary.coachingNotes,
                    communicationScore: snapshot.summary.communicationScore,
                }
                : null,
            maxDurationMinutes: snapshot.maxDurationMinutes,
            pausedAt: snapshot.pausedAt,
            totalPausedMs: snapshot.totalPausedMs,
            completedAt: snapshot.completedAt,
            createdAt: snapshot.createdAt,
            updatedAt: snapshot.updatedAt,
        };
    }

    public static toPaginatedResponseDto(result: PaginatedSceneSessionsResult): PaginatedSceneSessionsResponseDto {
        return {
            data: result.data.map((session) => SceneSessionDtoMapper.toResponseDto(session)),
            total: result.total,
        };
    }

    public static toScenarioResponseDto(scenario: Scenario): ScenarioResponseDto {
        const data = scenario.toJSON();
        return {
            id: data.id,
            title: data.title,
            description: data.description,
            category: data.category,
            promptContext: data.promptContext,
            isCustom: data.isCustom,
            creatorUserId: data.creatorUserId ?? null,
            createdAt: data.createdAt,
        };
    }
}

