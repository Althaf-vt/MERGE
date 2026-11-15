import { SceneSession } from "../../domain/entities/scene-session.entity";
import { PaginatedSceneSessionsResult, ScenePartnerAnalyticsRawData } from "../../domain/interfaces/scene-session-repository.interface";
import { PaginatedSceneSessionsResponseDto, SceneSessionResponseDto, SceneTurnResponseDto } from "../dtos/scene-session-response.dto";
import { AdminSessionListItemDto } from "../dtos/admin-session-list-item.dto";
import { AdminSessionDetailDto, SessionTelemetryDto, SessionTimelineEventDto } from "../dtos/admin-session-detail.dto";
import { ScenePartnerAnalyticsDto } from "../dtos/scene-partner-analytics.dto";
import { SceneSessionStatus, SceneSpeakerRole, SessionTimelineEventType, } from "../../../../shared/domain/enums/scene-partner.enums";

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
            durationMinutes: entity.getActiveDurationMinutes(),
            communicationScore: null,
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

        // Synthesize privacy-preserving operational timeline events (zero raw text leakage)
        const timeline: SessionTimelineEventDto[] = [];

        // 1. Session Initialized Event
        timeline.push({
            id: `evt-${snapshot.id}-init`,
            eventType: SessionTimelineEventType.SESSION_INITIALIZED,
            timestamp: snapshot.createdAt,
            metadata: {
                simulationType: snapshot.simulationType,
                isCoachingEnabled: snapshot.isCoachingEnabled,
                maxDurationMinutes: snapshot.maxDurationMinutes,
            },
        });

        // 2. Transcript Turn Events (Operational telemetry, zero raw text)
        snapshot.transcript.forEach((turn, index) => {
            if (turn.role === SceneSpeakerRole.SIMULATION) {
                if (index === 0) {
                    timeline.push({
                        id: `evt-${snapshot.id}-greeting`,
                        eventType: SessionTimelineEventType.PARTNER_GREETING_DELIVERED,
                        timestamp: turn.timestamp,
                        metadata: {
                            characterCount: turn.content.length,
                        },
                    });
                } else if (turn.coachNote) {
                    timeline.push({
                        id: `evt-${snapshot.id}-coach-${index}`,
                        eventType: SessionTimelineEventType.COACHING_TIP_GENERATED,
                        timestamp: turn.timestamp,
                        metadata: {
                            turnIndex: index,
                            tone: turn.coachNote.tone,
                            pacing: turn.coachNote.pacing,
                        },
                    });
                }
            } else if (turn.role === SceneSpeakerRole.USER) {
                timeline.push({
                    id: `evt-${snapshot.id}-user-${index}`,
                    eventType: SessionTimelineEventType.USER_MESSAGE_SENT,
                    timestamp: turn.timestamp,
                    metadata: {
                        turnIndex: index,
                        characterCount: turn.content.length,
                    },
                });
            }
        });

        // 3. Pause Event
        if (snapshot.pausedAt && snapshot.status === SceneSessionStatus.PAUSED) {
            timeline.push({
                id: `evt-${snapshot.id}-paused`,
                eventType: SessionTimelineEventType.SESSION_PAUSED,
                timestamp: snapshot.pausedAt,
                metadata: {
                    totalPausedMs: snapshot.totalPausedMs,
                },
            });
        }

        // 4. Completed Event
        if (snapshot.completedAt) {
            timeline.push({
                id: `evt-${snapshot.id}-completed`,
                eventType: SessionTimelineEventType.SESSION_COMPLETED,
                timestamp: snapshot.completedAt,
                metadata: {
                    totalTurns: snapshot.turnCount,
                    durationMinutes: entity.getActiveDurationMinutes(),
                    status: snapshot.status,
                },
            });
        }

        const coachingInterventionCount = snapshot.transcript.filter(
            (t) => t.coachNote !== null && t.coachNote !== undefined,
        ).length;

        const telemetry: SessionTelemetryDto = {
            durationMinutes: entity.getActiveDurationMinutes(),
            turnCount: snapshot.turnCount,
            coachingInterventionCount,
            isCoachingEnabled: snapshot.isCoachingEnabled,
            completedAt: snapshot.completedAt,
            totalPausedMs: snapshot.totalPausedMs,
        };

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
            turnCount: snapshot.turnCount,
            timeline,
            telemetry,
            // Privacy-redacted: raw conversation text and private scores are zero-leaked
            transcript: [],
            summary: null,
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

