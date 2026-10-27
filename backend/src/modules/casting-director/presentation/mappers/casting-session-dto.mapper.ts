import { CastingSessionResponseDto } from "../../application/dtos/casting-session-response.dto";
import { CastingSession } from "../../domain/entities/casting-session.entity";

export class CastingSessionDtoMapper {
    public static toResponseDto(entity: CastingSession): CastingSessionResponseDto {
        return {
            id: entity.id,
            userId: entity.userId,
            status: entity.status,
            transcript: entity.transcript.map(entry => ({
                role: entry.role,
                content: entry.content,
                timestamp: entry.timestamp,
            })),
            turnCount: entity.turnCount,
            maxTurns: entity.maxTurns,
            personalityVector: entity.personalityVector,
            aiSummary: entity.aiSummary,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        };
    }
}