import { SceneSession } from "../../domain/entities/scene-session.entity";
import { Scenario } from "../../domain/entities/scenario.entity";
import { PaginatedSceneSessionsResult, ScenePartnerAnalyticsRawData } from "../../domain/interfaces/scene-session-repository.interface";
import { PaginatedSceneSessionsResponseDto, SceneSessionResponseDto, SceneTurnResponseDto } from "../dtos/scene-session-response.dto";
import { ScenarioResponseDto } from "../dtos/scenario-response.dto";
import { AdminSessionListItemDto } from "../dtos/admin-session-list-item.dto";
import { AdminSessionDetailDto } from "../dtos/admin-session-detail.dto";
import { ScenePartnerAnalyticsDto } from "../dtos/scene-partner-analytics.dto";

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
            scenarioPromptContext: snapshot.scenarioPromptContext,
            targetUserId: snapshot.targetUserId,
            isCoachingEnabled: snapshot.isCoachingEnabled,
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

    public static toAdminListItemDto(entity: SceneSession): AdminSessionListItemDto {
        const snapshot = entity.toJSON();
        return {
            id: snapshot.id,
            userId: snapshot.userId,
            scenarioId: snapshot.scenarioId,
            scenarioTitle: snapshot.scenarioTitle,
            scenarioCategory: snapshot.scenarioCategory,
            simulationType: snapshot.simulationType,
            status: snapshot.status,
            turnCount: snapshot.turnCount,
            communicationScore: snapshot.summary?.communicationScore ?? null,
            isCoachingEnabled: snapshot.isCoachingEnabled,
            createdAt: snapshot.createdAt,
            completedAt: snapshot.completedAt,
        };
    }

    public static toAdminListItemDtoList(entities: SceneSession[]): AdminSessionListItemDto[] {
        return entities.map((entity) => SceneSessionDtoMapper.toAdminListItemDto(entity));
    }

    public static toAdminDetailDto(entity: SceneSession): AdminSessionDetailDto {
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
            scenarioPromptContext: snapshot.scenarioPromptContext,
            targetUserId: snapshot.targetUserId,
            isCoachingEnabled: snapshot.isCoachingEnabled,
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

    public static toAnalyticsDto(raw: ScenePartnerAnalyticsRawData): ScenePartnerAnalyticsDto {
        return {
            totalSessions: raw.totalSessions,
            completedSessions: raw.completedSessions,
            inProgressSessions: raw.inProgressSessions,
            pausedSessions: raw.pausedSessions,
            completionRate: this._calculatePercentage(raw.completedSessions, raw.totalSessions),
            coachingEnabledCount: raw.coachingEnabledCount,
            coachingDisabledCount: raw.coachingDisabledCount,
            coachingAdoptionRate: this._calculatePercentage(raw.coachingEnabledCount, raw.totalSessions),
            genericCount: raw.genericCount,
            matchBasedCount: raw.matchBasedCount,
            averageScore: raw.averageScore,
            averageTurnCount: raw.averageTurnCount,
            topScenarios: raw.topScenarios,
            categoryDistribution: raw.categoryDistribution,
        };
    }

    private static _calculatePercentage(count: number, total: number): number {
        if (total <= 0) return 0;
        const percentage = (count / total) * 100;
        return Math.round(percentage * 10) / 10;
    }
}

