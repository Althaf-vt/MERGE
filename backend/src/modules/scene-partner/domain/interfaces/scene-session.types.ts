import { ScenarioCategory, SceneSessionStatus, SceneSpeakerRole, SimulationType } from "../../../../shared/domain/enums/scene-partner.enums";
import { CoachNoteVO } from "../value-objects/coach-note.vo";
import { CoachNoteProps } from "./coach-note.types";
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
    scenarioPromptContext?: string | null;
    isCoachingEnabled?: boolean;
    targetUserId?: string | null;
    maxDurationMinutes?: number;
    isPreview?: boolean;
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
    scenarioPromptContext: string | null;
    isCoachingEnabled: boolean;
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
    isPreview: boolean;
}

export interface SceneSessionSnapshot {
    id: string;
    userId: string;
    simulationType: SimulationType;
    scenarioId: string;
    scenarioTitle: string;
    scenarioCategory: ScenarioCategory;
    scenarioPromptContext: string | null;
    isCoachingEnabled: boolean;
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
    isPreview: boolean;
}

