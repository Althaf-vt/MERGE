import { Types } from "mongoose";
import { DiscoveryCandidate, DiscoveryUserSearchContext } from "../../../domain/interfaces/discovery.types";
import { DiscoveryPass } from "../../../domain/entities/discovery-pass.entity";
import { DiscoveryPassSnapshot } from "../../../domain/interfaces/discovery-pass.types";

export class DiscoveryPersistenceMapper {
    public static toDomainUserSearchContext(raw: Record<string, any>): DiscoveryUserSearchContext {
        const id = raw._id instanceof Types.ObjectId ? raw._id.toHexString() : String(raw._id);
        return {
            id,
            personalityVector: raw.personalityVector || [],
            location: raw.location,
            preference: raw.preference,
        };
    }

    public static toDomainCandidate(raw: Record<string, any>): DiscoveryCandidate {
        const id = raw._id instanceof Types.ObjectId ? raw._id.toHexString() : String(raw._id);
        return {
            id,
            profile: raw.profile,
            preference: raw.preference,
            kycVerification: raw.kycVerification,
            photos: raw.photos,
            location: raw.location,
            matchScore: raw.matchScore ?? 0,
        };
    }

    public static toDomainCandidateList(rawList: Record<string, any>[]): DiscoveryCandidate[] {
        return rawList.map(raw => DiscoveryPersistenceMapper.toDomainCandidate(raw));
    }

    public static toPersistencePass(entity: DiscoveryPass): Record<string, unknown> {
        const snapshot: DiscoveryPassSnapshot = entity.toJSON();
        return {
            userId: snapshot.userId,
            targetUserId: snapshot.targetUserId,
            createdAt: snapshot.createdAt,
        };
    }
}
