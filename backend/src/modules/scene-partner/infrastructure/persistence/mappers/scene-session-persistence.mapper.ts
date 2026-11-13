import { SceneSession } from "../../../domain/entities/scene-session.entity";
import { ScenarioCategory, SceneSessionStatus, SceneSpeakerRole, SimulationType } from "../../../domain/enums/scene-partner.enums";
import { CoachNoteVO } from "../../../domain/value-objects/coach-note.vo";
import { SceneSessionDocument } from "../scene-session.schema";

export class SceneSessionPersistenceMapper {
    public static toDomain(raw: SceneSessionDocument): SceneSession {
        return new SceneSession({
            id: raw._id ? raw._id.toString() : "",
            userId: raw.userId,
            simulationType: raw.simulationType as SimulationType,
            scenarioId: raw.scenarioId,
            scenarioTitle: raw.scenarioTitle,
            scenarioCategory: raw.scenarioCategory as ScenarioCategory,
            targetUserId: raw.targetUserId ?? null,
            status: raw.status as SceneSessionStatus,
            transcript: (raw.transcript ?? []).map((entry) => ({
                role: entry.role as SceneSpeakerRole,
                content: entry.content,
                coachNote: entry.coachNote
                    ? CoachNoteVO.create({
                        observation: entry.coachNote.observation,
                        tone: entry.coachNote.tone,
                        pacing: entry.coachNote.pacing,
                        nextTip: entry.coachNote.nextTip,
                    })
                    : null,
                timestamp: entry.timestamp,
            })),
            turnCount: raw.turnCount,
            summary: raw.summary
                ? {
                    summary: raw.summary.summary,
                    thingsToNote: [...(raw.summary.thingsToNote ?? [])],
                    takeaways: [...(raw.summary.takeaways ?? [])],
                    coachingNotes: raw.summary.coachingNotes,
                    communicationScore: raw.summary.communicationScore,
                }
                : null,
            maxDurationMinutes: raw.maxDurationMinutes,
            pausedAt: raw.pausedAt ?? null,
            totalPausedMs: raw.totalPausedMs ?? 0,
            completedAt: raw.completedAt ?? null,
            createdAt: raw['createdAt'],
            updatedAt: raw['updatedAt'],
        });
    }

    public static toPersistence(entity: SceneSession): Record<string, unknown> {
        const data = entity.toJSON();
        return {
            userId: data.userId,
            simulationType: data.simulationType,
            scenarioId: data.scenarioId,
            scenarioTitle: data.scenarioTitle,
            scenarioCategory: data.scenarioCategory,
            targetUserId: data.targetUserId ?? null,
            status: data.status,
            transcript: data.transcript.map((entry) => ({
                role: entry.role,
                content: entry.content,
                coachNote: entry.coachNote
                    ? {
                        observation: entry.coachNote.observation,
                        tone: entry.coachNote.tone,
                        pacing: entry.coachNote.pacing,
                        nextTip: entry.coachNote.nextTip,
                    }
                    : null,
                timestamp: entry.timestamp,
            })),
            turnCount: data.turnCount,
            summary: data.summary
                ? {
                    summary: data.summary.summary,
                    thingsToNote: [...data.summary.thingsToNote],
                    takeaways: [...data.summary.takeaways],
                    coachingNotes: data.summary.coachingNotes,
                    communicationScore: data.summary.communicationScore,
                }
                : null,
            maxDurationMinutes: data.maxDurationMinutes,
            pausedAt: data.pausedAt ?? null,
            totalPausedMs: data.totalPausedMs,
            completedAt: data.completedAt ?? null,
        };
    }
}
