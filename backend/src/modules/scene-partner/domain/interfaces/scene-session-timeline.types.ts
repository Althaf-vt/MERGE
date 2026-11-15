import { SessionTimelineEventType } from "../../../../shared/domain/enums/scene-partner.enums";

export interface SessionTimelineEvent {
    id: string;
    eventType: SessionTimelineEventType;
    timestamp: Date;
    metadata?: Record<string, unknown> | null;
}

export interface SessionTelemetryData {
    durationMinutes: number;
    turnCount: number;
    coachingInterventionCount: number;
    isCoachingEnabled: boolean;
    completedAt?: Date | null;
    totalPausedMs: number;
}
