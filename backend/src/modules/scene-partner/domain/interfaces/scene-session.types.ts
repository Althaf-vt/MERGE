import { ScenarioCategory, SceneSessionStatus, SceneSpeakerRole, SimulationType } from "../enums/scene-partner.enums";
import { CoachNoteProps, CoachNoteVO } from "../value-objects/coach-note.vo";
import { SceneSessionSummaryData } from "./scene-partner-ai.interface";

export interface SceneTurn {
    role: SceneSpeakerRole;
    content: string;
    coachNote?: CoachNoteVO | null;
    timestamp: Date;
}

export interface SceneTurnSnapshot {
    role: SceneSpeakerRole;
    content: string;
    coachNote: CoachNoteProps | null;
    timestamp: Date;
}

export interface CreateSceneSessionProps {
    id?: string;
    userId: string;
    simulationType: SimulationType;
    scenarioId: string;
    scenarioTitle: string;
    scenarioCategory: ScenarioCategory;
    targetUserId?: string | null;
    maxDurationMinutes?: number;
}

export interface SceneSessionProps extends CreateSceneSessionProps {
    status?: SceneSessionStatus;
    transcript?: SceneTurn[];
    turnCount?: number;
    summary?: SceneSessionSummaryData | null;
    pausedAt?: Date | null;
    totalPausedMs?: number;
    completedAt?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface SceneSessionData {
    id: string;
    userId: string;
    simulationType: SimulationType;
    scenarioId: string;
    scenarioTitle: string;
    scenarioCategory: ScenarioCategory;
    targetUserId: string | null;
    status: SceneSessionStatus;
    transcript: SceneTurn[];
    turnCount: number;
    summary: SceneSessionSummaryData | null;
    maxDurationMinutes: number;
    pausedAt: Date | null;
    totalPausedMs: number;
    completedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface SceneSessionSnapshot {
    id: string;
    userId: string;
    simulationType: SimulationType;
    scenarioId: string;
    scenarioTitle: string;
    scenarioCategory: ScenarioCategory;
    targetUserId: string | null;
    status: SceneSessionStatus;
    transcript: SceneTurnSnapshot[];
    turnCount: number;
    summary: SceneSessionSummaryData | null;
    maxDurationMinutes: number;
    pausedAt: Date | null;
    totalPausedMs: number;
    completedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

