import { CastingSessionStatus, TranscriptRole } from "../../domain/enums/casting.enums";

export interface TranscriptEntryDto {
    role: TranscriptRole;
    content: string;
    timestamp: Date;
}

export interface CastingSessionResponseDto {
    id?: string;
    userId: string;
    status: CastingSessionStatus;
    transcript: TranscriptEntryDto[];
    turnCount: number;
    maxTurns?: number;
    personalityVector?: number[];
    aiSummary?: string;
    createdAt?: Date;
    updatedAt?: Date;
}