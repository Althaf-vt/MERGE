export type CastingSessionStatus = 'IN_PROGRESS' | 'ANALYZING' | 'COMPLETED';

export type TranscripRole = 'ai' | 'user';

export interface TranscriptEntry {
    role: TranscripRole;
    content: string;
    timestamp: Date | string;
}

export interface CastingSession {
    id: string;
    userId: string;
    status: CastingSessionStatus;
    transcript: TranscriptEntry[];
    turnCount: number;
    maxTurns: number;
    personalityVector?: number[];
    aiSummary?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CastingResponse {
    success: boolean;
    session: CastingSession;
}