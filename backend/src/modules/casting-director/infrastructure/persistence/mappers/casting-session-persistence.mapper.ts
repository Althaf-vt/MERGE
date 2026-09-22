import { CastingSession } from "../../../domain/entities/casting-session.entity";
import { CastingSessionStatus, TranscriptRole } from "../../../domain/enums/casting.enums";
import { CastingSessionDocument } from "../casting-session.schema";

export class CastingSessionPersistenceMapper{
    // Converts the Mongoose document into our pure Domain Entity
    public static toDomain(raw: CastingSessionDocument): CastingSession {
        return new CastingSession({
            id: raw._id.toString(),
            userId: raw.userId,
            status: raw.status as CastingSessionStatus,
            transcript: raw.transcript.map(entry => ({
                role: entry.role as TranscriptRole,
                content: entry.content,
                timestamp: entry.timestamp,
            })),
            turnCount: raw.turnCount,
            maxTurns: raw.maxTurns,
            personalityVector: raw.personalityVector,
            aiSummary: raw.aiSummary,
            createdAt: raw['createdAt'],
            updatedAt: raw['updatedAt'],
        });
    }

    // Flattens the Domain Entity into a plain object for MongoDB
    public static toPersistence(entity: CastingSession): any {
        const data = entity.toJSON();
        return {
            userId: data.userId,
            status: data.status,
            transcript: data.transcript.map(entry => ({
                role: entry.role,
                content: entry.content,
                timestamp: entry.timestamp,
            })),
            turnCount: data.turnCount,
            maxTurns: data.maxTurns,
            personalityVector: data.personalityVector,
            aiSummary: data.aiSummary ?? null,
        };
    }
}