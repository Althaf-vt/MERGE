import { CastingSessionStatus, TranscriptRole } from "../enums/casting.enums";

export interface TranscriptEntry {
    role: TranscriptRole;
    content: string;
    timestamp: Date;
}

export interface CastingSessionProps {
    id?: string;
    userId: string;
    status?: CastingSessionStatus;
    transcript?: TranscriptEntry[];
    turnCount?: number;
    maxTurns?: number;
    personalityVector?: number[];
    aiSummary?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface InternalCastingSessionProps {
    id?: string;
    userId: string;
    status: CastingSessionStatus;
    transcript: TranscriptEntry[];
    turnCount: number;
    maxTurns: number;
    personalityVector: number[];
    aiSummary?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CastingSessionSnapshot {
    id?: string;
    userId: string;
    status: CastingSessionStatus;
    transcript: TranscriptEntry[];
    turnCount: number;
    maxTurns: number;
    personalityVector: number[];
    aiSummary?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
