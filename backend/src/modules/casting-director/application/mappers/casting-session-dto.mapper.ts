import { CastingSessionResponseDto } from "../dtos/casting-session-response.dto";
import { CastingSession } from "../../domain/entities/casting-session.entity";
import { CastingSessionSnapshot } from "../../domain/interfaces/casting-session.types";

export class CastingSessionDtoMapper {
    public static toResponseDto(entity: CastingSession): CastingSessionResponseDto {
        const snapshot: CastingSessionSnapshot = entity.toJSON();
        return {
            id: snapshot.id,
            userId: snapshot.userId,
            status: snapshot.status,
            transcript: snapshot.transcript.map(entry => ({
                role: entry.role,
                content: entry.content,
                timestamp: entry.timestamp,
            })),
            turnCount: snapshot.turnCount,
            maxTurns: snapshot.maxTurns,
            personalityVector: snapshot.personalityVector,
            aiSummary: snapshot.aiSummary,
            createdAt: snapshot.createdAt,
            updatedAt: snapshot.updatedAt,
        };
    }
}